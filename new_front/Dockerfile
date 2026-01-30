FROM nginx:alpine

# Copy website files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY app.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY auth.js /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY env.js /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
