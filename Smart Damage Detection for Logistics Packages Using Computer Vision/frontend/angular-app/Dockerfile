FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
# Full install needed — Angular build tools are devDependencies
RUN npm ci

COPY . .

# For docker-compose, default API_URL points to the backend container
ARG API_URL=http://localhost:8000/api
RUN sed -i "s|%%API_URL%%|${API_URL}|g" src/environments/environment.prod.ts
RUN npm run build

FROM nginx:alpine

# Angular 17+ with @angular/build:application outputs to dist/<name>/browser
COPY --from=build /app/dist/damage-detection-frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]