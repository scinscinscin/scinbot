FROM node:15-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && echo Alpine 3.11 > /etc/issue
COPY . .
CMD [ "node", "main.js" ]