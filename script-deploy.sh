#! /usr/bin/env sh

# Exit in case of error
set -e

DOMAIN=${DOMAIN} \
STACK_NAME=${STACK_NAME} \
TAG=${TAG} \
docker-compose \
-f docker-compose.deploy.images.yml \
-f docker-compose.deploy.labels.yml \
-f docker-compose.deploy.networks.yml \
config > docker-stack.yml

docker stack deploy -c docker-stack.yml --with-registry-auth ${STACK_NAME}
