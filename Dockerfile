# Gunakan image Node.js versi LTS
FROM node:18-alpine AS development

# Set working directory
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin semua file proyek
COPY . .

# Jalankan aplikasi dalam mode pengembangan
CMD ["npm", "run", "start:dev"]
