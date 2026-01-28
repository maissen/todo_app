#!/bin/sh

# Generate env.js from environment variables
cat > /usr/share/nginx/html/env.js <<EOF
window.ENV = {
    API_URL: '${API_URL}'
};
EOF

echo "Environment configuration loaded:"
echo "API_URL: ${API_URL}"

# Start nginx
exec nginx -g 'daemon off;'
