const {Gateway} = require("fabric-network");

const fs = require('fs');
const {FileSystemWallet} = require('fabric-network');
const path = require('path');

const yaml = require('js-yaml');
const walletPath = path.join(process.cwd(), '..', 'wallet');
const ccpPath = path.join(process.cwd(), '..', 'gateway', 'networkConnection.yaml');
let connectionProfile = yaml.safeLoad(fs.readFileSync(ccpPath, 'utf8'));

function getWallet() {
    const wallet = new FileSystemWallet(walletPath);
    return wallet
}

async function getGateWay(identity) {
    let wallet = getWallet()
    const userExists = wallet.exists(identity);
    if (!userExists) {
        throw `An identity for the user ${identity} does not exist in the wallet`
    }
    const gateway = new Gateway()
    await gateway.connect(connectionProfile, {
        wallet, identity: identity, discovery: {enabled: false, asLocalhost: true}
    })
    return gateway

}

module.exports = {getWallet, getGateWay};
