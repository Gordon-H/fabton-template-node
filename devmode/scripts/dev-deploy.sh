#!/usr/bin/env bash

echo "=============== install and instantiate the chaincode in the dev mode ==================="

docker exec peer peer chaincode install -n {{contract}} -v 0 -p /opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode -l node
docker exec peer peer chaincode instantiate -n {{contract}} -v 0 -c '{"Args":["{{namespace}}:instantiate"]}' -o orderer:7050 -C myc

echo "=============== finish ==================="
