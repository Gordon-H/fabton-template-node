'use strict';


const FabricCAServices = require("fabric-ca-client");

const factory = require('./factory.js');
const {X509WalletMixin} = require('fabric-network');

const ADMIN = 'admin'
const MSPID = 'forchainMSP'
const CA_NAME = 'ca-forchain'
const CHANNEL_NAME = 'myc'


constructor(
    enrollAdmin()
);


async function enrollAdmin() {
    const caURL = 'http://192.168.0.15:30054';
    const ca = new FabricCAServices(caURL);

    const wallet = factory.getWallet();
    const adminExists = await wallet.exists('admin');
    if (adminExists) {
        console.log('An identity for the admin user "admin" already exists in the wallet')
        return
    } else {
        console.log('admin not exist ')
    }

    const enrollment = await ca.enroll({enrollmentID: 'admin', enrollmentSecret: 'adminpw'});
    const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
    wallet.import(ADMIN, identity);
    console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

}

async function register(affiliation, userId) {
    const gateway = await factory.getGateWay(ADMIN);
    try {
        const wallet = factory.getWallet();
        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userId);
        if (userExists) {
            throw new Error(`用户：${userId} 已存在`);
        }
        const ca = gateway.getClient().getCertificateAuthority(CA_NAME);
        const adminIdentity = gateway.getCurrentIdentity();

        const secret = await ca.register({
            affiliation: affiliation,
            enrollmentID: userId,
            role: 'client'
        }, adminIdentity);
        const enrollment = await ca.enroll({enrollmentID: userId, enrollmentSecret: secret});
        const userIdentity = X509WalletMixin.createIdentity(MSPID, enrollment.certificate, enrollment.key.toBytes());
        wallet.import(userId, userIdentity);
        console.log(`Successfully registered and enrolled admin user ${userId} and imported it into the wallet`);
    } finally {
        gateway.disconnect();
    }
}

async function deleteUser(userId) {
    const gateway = await factory.getGateWay(ADMIN);
    try {
        const ca = gateway.getClient().getCertificateAuthority(CA_NAME);
        const adminIdentity = gateway.getCurrentIdentity();
        await ca.newIdentityService().delete(userId, adminIdentity)
        console.log(`Successfully delete user ${userId}`);
        const wallet = factory.getWallet();
        await wallet.delete(userId)

        if(await wallet.exists(userId)){
            throw Error(`The cert file of ${userId} is still exists.`)
        }

    } finally {
        gateway.disconnect();
    }
}


module.exports = {deleteUser, register, enrollAdmin};
