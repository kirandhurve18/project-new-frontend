# Stage 1 - build Angular app
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY . .
RUN npx ng build --configuration production

# Stage 2 - Nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/hrms/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

