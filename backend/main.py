from fastapi import FastAPI, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
import models
import schemas
import auth
from database import engine, get_db
from datetime import datetime
import os
from s3_utils import (
    upload_file_to_s3,
    delete_file_from_s3,
    generate_unique_filename,
    is_valid_image_type
)

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API", version="1.0.0")
security = HTTPBearer()

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


# Dependency to get current user from token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = auth.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "INVALID_TOKEN",
                    "message": "JWT token is invalid or expired"
                }
            }
        )
    
    user = db.query(models.User).filter(models.User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "INVALID_TOKEN",
                    "message": "User not found"
                }
            }
        )
    return user


@app.get("/")
async def root():
    return {"message": "Todo API is running"}


# Authentication Endpoints
@app.post("/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username exists
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "USERNAME_EXISTS",
                    "message": "Username already taken"
                }
            }
        )
    
    # Create new user
    hashed_password = auth.get_password_hash(user_data.password)
    new_user = models.User(username=user_data.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    token = auth.create_access_token({"user_id": new_user.id})
    
    return schemas.UserResponse(
        id=str(new_user.id),
        username=new_user.username,
        token=token
    )


@app.post("/auth/login", response_model=schemas.UserResponse)
async def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(models.User).filter(models.User.username == user_data.username).first()
    
    if not user or not auth.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "INVALID_CREDENTIALS",
                    "message": "Username or password is incorrect"
                }
            }
        )
    
    # Generate token
    token = auth.create_access_token({"user_id": user.id})
    
    return schemas.UserResponse(
        id=str(user.id),
        username=user.username,
        token=token
    )


# Todo Endpoints
@app.get("/todos", response_model=schemas.TodoListResponse)
async def get_todos(
    status_filter: Optional[str] = Query(None, alias="status"),
    sort: Optional[str] = Query("createdAt"),
    order: Optional[str] = Query("desc"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Todo).filter(models.Todo.user_id == current_user.id)
    
    # Filter by status
    if status_filter == "completed":
        query = query.filter(models.Todo.completed == True)
    elif status_filter == "pending":
        query = query.filter(models.Todo.completed == False)
    
    # Sort
    if sort == "createdAt":
        if order == "asc":
            query = query.order_by(models.Todo.created_at.asc())
        else:
            query = query.order_by(models.Todo.created_at.desc())
    
    todos = query.all()
    
    return schemas.TodoListResponse(
        todos=[schemas.TodoResponse.from_orm(todo) for todo in todos],
        total=len(todos)
    )


@app.get("/todos/{todo_id}", response_model=schemas.TodoResponse)
async def get_todo(
    todo_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "Requested todo does not exist"
                }
            }
        )
    
    if todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "UNAUTHORIZED_ACCESS",
                    "message": "User doesn't have permission"
                }
            }
        )
    
    return schemas.TodoResponse.from_orm(todo)


@app.post("/todos", response_model=schemas.TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: schemas.TodoCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_todo = models.Todo(
        title=todo_data.title,
        description=todo_data.description,
        user_id=current_user.id
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    
    return schemas.TodoResponse.from_orm(new_todo)


@app.put("/todos/{todo_id}", response_model=schemas.TodoResponse)
async def update_todo(
    todo_id: str,
    todo_data: schemas.TodoUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "Requested todo does not exist"
                }
            }
        )
    
    if todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "UNAUTHORIZED_ACCESS",
                    "message": "User doesn't have permission"
                }
            }
        )
    
    # Update fields
    if todo_data.title is not None:
        todo.title = todo_data.title
    if todo_data.description is not None:
        todo.description = todo_data.description
    if todo_data.completed is not None:
        todo.completed = todo_data.completed
    
    todo.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(todo)
    
    return schemas.TodoResponse.from_orm(todo)


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "Requested todo does not exist"
                }
            }
        )
    
    if todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "UNAUTHORIZED_ACCESS",
                    "message": "User doesn't have permission"
                }
            }
        )
    
    db.delete(todo)
    db.commit()
    
    return None


# Todo Image Endpoints
@app.post("/todos/{todo_id}/image/presigned-url", response_model=schemas.PresignedUrlResponse)
async def get_todo_image_presigned_url(
    todo_id: str,
    filename: str,
    content_type: str,
    current_user: models.User = Depends(get_current_user)
):
    # Get the todo
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "Requested todo does not exist"
                }
            }
        )
    
    if todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "UNAUTHORIZED_ACCESS",
                    "message": "User doesn't have permission"
                }
            }
        )
    
    # Validate file type
    if not is_valid_image_type(content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "INVALID_FILE_TYPE",
                    "message": "File type not supported. Supported formats: JPEG, PNG, GIF, WEBP"
                }
            }
        )
    
    # Generate unique filename
    bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
    object_key, _ = generate_unique_filename(filename, todo.user_id, "todos")
    
    try:
        # Generate pre-signed upload URL
        presigned_url = generate_presigned_upload_url(
            bucket_name,
            object_key,
            content_type
        )
        
        # Calculate expiration time
        expires_at = datetime.utcnow() + timedelta(seconds=3600)  # 1 hour
        
        return schemas.PresignedUrlResponse(
            presignedUrl=presigned_url,
            objectKey=object_key,
            expiresAt=expires_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "UPLOAD_FAILED",
                    "message": str(e)
                }
            }
        )


@app.post("/todos/{todo_id}/image", response_model=schemas.TodoResponse)
async def save_todo_image_metadata(
    todo_id: str,
    object_key: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get the todo
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "Requested todo does not exist"
                }
            }
        )
    
    if todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "UNAUTHORIZED_ACCESS",
                    "message": "User doesn't have permission"
                }
            }
        )
    
    # If todo already has an image, delete the old one
    if todo.image_key:
        try:
            bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
            delete_file_from_s3(bucket_name, todo.image_key)
        except Exception:
            # Log the error but continue
            print(f"Failed to delete old image for todo {todo.id}")
    
    try:
        # Update todo record with new image info
        bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
        todo.image_key = object_key
        todo.image_url = f"https://{bucket_name}.s3.amazonaws.com/{object_key}"
        todo.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(todo)
        
        return schemas.TodoResponse.from_orm(todo)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "UPLOAD_FAILED",
                    "message": str(e)
                }
            }
        )


@app.get("/todos/{todo_id}/image", response_model=schemas.ProfilePictureGetResponse)
async def get_todo_image(
    todo_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "Requested todo does not exist"
                }
            }
        )
    
    if todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "UNAUTHORIZED_ACCESS",
                    "message": "User doesn't have permission"
                }
            }
        )
    
    if not todo.image_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NO_IMAGE_FOUND",
                    "message": "Todo item has no associated image"
                }
            }
        )
    
    try:
        # Generate pre-signed URL for the todo image
        bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
        presigned_url = generate_presigned_get_url(
            bucket_name,
            todo.image_key
        )
        
        return schemas.ProfilePictureGetResponse(
            profilePictureUrl=presigned_url
        )
    except Exception:
        # Fallback to the stored URL if pre-signed URL generation fails
        return schemas.ProfilePictureGetResponse(
            profilePictureUrl=todo.image_url
        )


@app.delete("/todos/{todo_id}/image", response_model=schemas.TodoResponse)
async def delete_todo_image(
    todo_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "TODO_NOT_FOUND",
                    "message": "Requested todo does not exist"
                }
            }
        )
    
    if todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "UNAUTHORIZED_ACCESS",
                    "message": "User doesn't have permission"
                }
            }
        )
    
    if not todo.image_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NO_IMAGE_FOUND",
                    "message": "Todo item has no associated image"
                }
            }
        )
    
    try:
        # Delete from S3
        bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
        delete_file_from_s3(bucket_name, todo.image_key)
        
        # Update todo record to remove image info
        todo.image_url = None
        todo.image_key = None
        todo.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(todo)
        
        return schemas.TodoResponse.from_orm(todo)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "DELETE_FAILED",
                    "message": str(e)
                }
            }
        )


# Profile Picture Endpoints
@app.post("/profile/picture/presigned-url", response_model=schemas.PresignedUrlResponse)
async def get_profile_picture_presigned_url(
    filename: str,
    content_type: str,
    current_user: models.User = Depends(get_current_user)
):
    # Validate file type
    if not is_valid_image_type(content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": {
                    "code": "INVALID_FILE_TYPE",
                    "message": "File type not supported. Supported formats: JPEG, PNG, GIF, WEBP"
                }
            }
        )
    
    # Generate unique filename
    bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
    object_key, _ = generate_unique_filename(filename, current_user.id, "profiles")
    
    try:
        # Generate pre-signed upload URL
        presigned_url = generate_presigned_upload_url(
            bucket_name,
            object_key,
            content_type
        )
        
        # Calculate expiration time
        expires_at = datetime.utcnow() + timedelta(seconds=3600)  # 1 hour
        
        return schemas.PresignedUrlResponse(
            presignedUrl=presigned_url,
            objectKey=object_key,
            expiresAt=expires_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "UPLOAD_FAILED",
                    "message": str(e)
                }
            }
        )


@app.post("/profile/picture", response_model=schemas.ProfilePictureResponse)
async def save_profile_picture_metadata(
    object_key: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If user already has a profile picture, delete the old one
    if current_user.profile_picture_key:
        try:
            bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
            delete_file_from_s3(bucket_name, current_user.profile_picture_key)
        except Exception:
            # Log the error but continue
            print(f"Failed to delete old profile picture for user {current_user.id}")
    
    try:
        # Update user record with new profile picture info
        bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
        current_user.profile_picture_key = object_key
        current_user.profile_picture_url = f"https://{bucket_name}.s3.amazonaws.com/{object_key}"
        current_user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(current_user)
        
        return schemas.ProfilePictureResponse(
            id=current_user.id,
            username=current_user.username,
            profilePictureUrl=current_user.profile_picture_url,
            updatedAt=current_user.updated_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "UPLOAD_FAILED",
                    "message": str(e)
                }
            }
        )


@app.get("/profile/picture", response_model=schemas.ProfilePictureGetResponse)
async def get_profile_picture(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile_picture_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "PROFILE_PICTURE_NOT_FOUND",
                    "message": "User has no profile picture"
                }
            }
        )
    
    try:
        # Generate pre-signed URL for the profile picture
        bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
        presigned_url = generate_presigned_get_url(
            bucket_name,
            current_user.profile_picture_key
        )
        
        return schemas.ProfilePictureGetResponse(
            profilePictureUrl=presigned_url
        )
    except Exception:
        # Fallback to the stored URL if pre-signed URL generation fails
        return schemas.ProfilePictureGetResponse(
            profilePictureUrl=current_user.profile_picture_url
        )


@app.delete("/profile/picture", response_model=schemas.ProfilePictureResponse)
async def delete_profile_picture(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile_picture_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "PROFILE_PICTURE_NOT_FOUND",
                    "message": "User has no profile picture to delete"
                }
            }
        )
    
    try:
        # Delete from S3
        bucket_name = os.getenv("S3_BUCKET_NAME", "todo-app-bucket")
        delete_file_from_s3(bucket_name, current_user.profile_picture_key)
        
        # Update user record to remove profile picture info
        current_user.profile_picture_url = None
        current_user.profile_picture_key = None
        current_user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(current_user)
        
        return schemas.ProfilePictureResponse(
            id=current_user.id,
            username=current_user.username,
            profilePictureUrl=current_user.profile_picture_url,
            updatedAt=current_user.updated_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": "DELETE_FAILED",
                    "message": str(e)
                }
            }
        )
