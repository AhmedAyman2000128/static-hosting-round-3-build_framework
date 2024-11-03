FROM node:18-alpine

WORKDIR /app/poc3_backend

EXPOSE 3000

ENV HOST_PROJECTS_DIR=E:/University/graduation_project/static-hosting-round-3-build_framework/backend/projects

RUN apk --no-cache add docker

COPY package*.json ./

RUN npm install

COPY . .

CMD ["sh", "-c", "npx tsc && npm start"]