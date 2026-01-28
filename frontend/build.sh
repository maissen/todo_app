#!/bin/bash

# Todo App - Build and Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Todo Application - Build Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Menu
echo "What would you like to do?"
echo "1) Build and start the application"
echo "2) Stop the application"
echo "3) View logs"
echo "4) Rebuild the application"
echo "5) Clean up (remove containers and images)"
echo "6) Exit"
echo ""
read -p "Enter your choice [1-6]: " choice

case $choice in
    1)
        print_info "Building and starting the application..."
        docker-compose up -d --build
        print_info "Application started successfully!"
        print_info "Access the application at: http://localhost:8080"
        print_info "Health check: http://localhost:8080/health"
        ;;
    2)
        print_info "Stopping the application..."
        docker-compose down
        print_info "Application stopped successfully!"
        ;;
    3)
        print_info "Showing logs (press Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    4)
        print_info "Rebuilding the application..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        print_info "Application rebuilt and started successfully!"
        print_info "Access the application at: http://localhost:8080"
        ;;
    5)
        print_warning "This will remove all containers and images for this application."
        read -p "Are you sure? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            print_info "Cleaning up..."
            docker-compose down -v
            docker rmi todo-frontend 2>/dev/null || true
            print_info "Cleanup completed!"
        else
            print_info "Cleanup cancelled."
        fi
        ;;
    6)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Exiting..."
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Done!${NC}"
echo -e "${GREEN}========================================${NC}"
