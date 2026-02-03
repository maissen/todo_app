#!/bin/bash

echo "Setting up Flask version of Todo App..."

# Create directories
echo "Creating directories..."
mkdir -p templates static

# Copy HTML files to templates
echo "Moving HTML files to templates/..."
cp index.html templates/ 2>/dev/null || echo "index.html already in place"
cp app.html templates/ 2>/dev/null || echo "app.html already in place"

# Copy static files
echo "Moving static files to static/..."
cp styles.css static/ 2>/dev/null || echo "styles.css already in place"
cp auth.js static/ 2>/dev/null || echo "auth.js already in place"
cp app.js static/ 2>/dev/null || echo "app.js already in place"

# Note: env.js is no longer needed - Flask generates it dynamically

echo ""
echo "✅ Setup complete!"
echo ""
echo "File structure:"
echo "  templates/index.html"
echo "  templates/app.html"
echo "  static/styles.css"
echo "  static/auth.js"
echo "  static/app.js"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run: docker-compose -f docker-compose.flask.yml up -d"
echo "3. Access at http://localhost:5000"
echo ""
