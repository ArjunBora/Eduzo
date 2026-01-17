FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Expose port (Vite default is 5173, but we might want to map to 3000)
EXPOSE 3000

# Start with host 0.0.0.0 to allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
