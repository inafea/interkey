#! /usr/bin/env sh

# Exit in case of error
set -e

TAG=${TAG} \
source ./script-build.sh

docker-compose -f docker-stack.yml push