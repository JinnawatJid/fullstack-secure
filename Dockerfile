FROM node:18

WORKDIR /app/backendz

COPY ./backend/package*.json ./
RUN npm install --omit=dev

COPY ./backend .
COPY ./frontend ../frontend

EXPOSE 3000
CMD ["npm", "start"]
