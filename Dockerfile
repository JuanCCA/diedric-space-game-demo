FROM nginx:alpine

# Copiar archivos del juego al directorio de nginx
COPY src/ /usr/share/nginx/html/

# Configuración nginx minimal (opcional)
RUN echo 'gzip on; gzip_types text/css application/javascript;' > /etc/nginx/conf.d/gzip.conf


# Exponemos el puerto que Dokku asigna
EXPOSE 80

# NGINX ya sirve archivos estáticos automáticamente
CMD ["nginx", "-g", "daemon off;"]
