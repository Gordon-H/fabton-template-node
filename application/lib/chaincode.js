'use strict';

const factory = require('./factory.js')


async function send(identity, type, channel, contractName, func, ...args) {
    const gateway = await factory.getGateWay(identity);
    try {
        const network = await gateway.getNetwork(channel);

        const contract = await network.getContract(contractName);
        let response
        if (type === 'query') {
            response = await contract.evaluateTransaction(func, ...args);
        } else {
            response = await contract.submitTransaction(func, ...args);
        }
        return response
    } finally {
        gateway.disconnect();
    }
}

module.exports = {send};
