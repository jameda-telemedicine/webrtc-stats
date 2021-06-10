FROM nginx:1.19

EXPOSE 80
WORKDIR /usr/share/nginx/html
COPY index.html .
COPY entrypoint.sh /docker-entrypoint.d/99-replace-with-env.sh
