FROM node:24
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
# package.json controls how the app starts
# CMD ["npm", "start"]
CMD ["npm", "run", "dev:setup"]