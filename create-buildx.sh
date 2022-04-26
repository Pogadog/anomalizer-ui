#!/bin/bash

# buildx: a builder to assist with amd64 image creation on the apple m1 silicon (arm64) chipset

docker buildx create --name mybuilder --driver-opt network=host --use
docker buildx inspect --bootstrap
