FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist/demo/browser /usr/share/nginx/html
COPY --from=build /app/src/public/env.template.js /usr/share/nginx/html/env.template.js
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create env.js from template with environment variables
RUN sed -e "s|\${VITE_API_URL}|${VITE_API_URL}|g" \
    -e "s|\${VITE_SERVER_NUMBER}|${VITE_SERVER_NUMBER}|g" \
    /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js && \
    rm /usr/share/nginx/html/env.template.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
