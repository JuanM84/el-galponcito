# Usamos Node.js
FROM node:22-slim

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos las dependencias
COPY package*.json ./

# Instalamos
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto 3000
EXPOSE 3000

# Comando para iniciar React
CMD ["npm", "run", "dev"]