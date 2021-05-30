FROM node:lts-buster-slim
RUN apt-get update -y && apt-get install geoip-database -y && rm -rf /var/lib/apt/lists/*
COPY . /app/
WORKDIR /app/
RUN yarn
CMD [ "yarn", "start" ]