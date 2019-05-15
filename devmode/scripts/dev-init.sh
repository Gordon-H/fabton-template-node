#!/usr/bin/env bash

echo "=============== init the dev mode env ==================="
docker-compose -f ../devmode/docker-contract-dev.yaml up -d
sleep 2
docker exec peer peer channel create -o orderer:7050 -c myc -f myc.tx
docker exec peer peer channel join -b myc.block

echo "=============== finish ==================="
