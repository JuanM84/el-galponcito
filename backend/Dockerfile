# Usamos una versión ligera de Node.js
FROM node:22-slim

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto que usa el backend
EXPOSE 3001

# Comando para iniciar la aplicación en modo desarrollo
CMD ["npm", "run", "dev"]