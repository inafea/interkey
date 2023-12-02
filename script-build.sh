#! /usr/bin/env sh

# Exit in case of error
set -e

TAG=${TAG} \
docker-compose \
-f docker-compose.shared.build.yml \
-f docker-compose.deploy.images.yml \
config > docker-stack.yml

docker-compose -f docker-stack.yml build
