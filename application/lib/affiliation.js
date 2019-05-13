'use strict';
const factory = require('./factory.js');
const ADMIN = 'admin'
const CA_NAME = 'ca'

constructor(
    create('common')
);

async function create(orgName) {
    const gateway = await factory.getGateWay(ADMIN);
    try {
        const ca = gateway.getClient().getCertificateAuthority(CA_NAME);
        const adminIdentity = gateway.getCurrentIdentity();
        const af = ca.newAffiliationService()
        const res = await af.create({name: orgName}, adminIdentity)
        return res
    } finally {
        gateway.disconnect();
    }
}

async function listOrg() {
    const gateway = await factory.getGateWay(ADMIN);
    try {
        const ca = gateway.getClient().getCertificateAuthority(CA_NAME);
        const adminIdentity = gateway.getCurrentIdentity();
        const af = ca.newAffiliationService()
        const res = await af.getAll(adminIdentity)
        return res
    } finally {
        gateway.disconnect();
    }
}

async function deleteOrg(orgName) {
    const gateway = await factory.getGateWay(ADMIN);
    try {
        const ca = gateway.getClient().getCertificateAuthority(CA_NAME);
        const adminIdentity = gateway.getCurrentIdentity();
        const af = ca.newAffiliationService()
        const res = await af.delete({name: orgName}, adminIdentity)
        return res
    } finally {
        gateway.disconnect();
    }
}

module.exports = {listOrg, create, deleteOrg};
