FROM node:10 as node

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY ./ /app

RUN make build_prod


FROM nginx:1.15

COPY --from=node /app/.build/ /usr/share/nginx/html/
