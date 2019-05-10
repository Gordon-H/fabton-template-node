'use strict';


const FabricCAServices = require("fabric-ca-client");

const factory = require('./factory.js');
const {X509WalletMixin} = require('fabric-network');

const ADMIN = 'admin'
const MSPID = 'forchainMSP'
const CA_NAME = 'ca-forchain'
const CHANNEL_NAME = 'medicalchannel'


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

        // 判断用户证书是否已经被清除， 如果没有则报错
        if(await wallet.exists(userId)){
            throw Error(`${userId}的证书清理失败！请手动清理！`)
        }

    } finally {
        gateway.disconnect();
    }
}

// TODO 待完善
async function revokeUser(userId, adminIdentity) {
    try {

        let config_proto = null;
        let original_config_proto = null;
        let original_config_json = null;
        let updated_config_proto = null;
        let updated_config_json = null;
        let signatures = [];
        let request = null;


        //const client = new Client();
        const client = adminIdentity.getClient();

        const channel = await client.getChannel(CHANNEL_NAME);
        const config_envelope = await channel.getChannelConfig();
        console.log('Successfully read the current channel configuration');
        original_config_proto = config_envelope.config.toBuffer();
        let response = await agent.post('http://127.0.0.1:7059/protolator/decode/common.Config',
            original_config_proto)
            .buffer();
        original_config_json = response.text.toString();
        logger.info(' original_config_json :: %s', original_config_json);
        // make a copy of the original so we can edit it
        updated_config_json = original_config_json;

        // 拿到可以用来更新 crl 列表的 updated_config
        const updated_config = JSON.parse(updated_config_json);

        // 获取 crl 信息
        const caURL = 'http://localhost:7054';
        const ca = new FabricCAServices(caURL);
        const crl = await ca.generateCRL({},adminIdentity);



        // 获取fabric的org信息
        const orgs = channel.getOrganizations();
        // 查询用户的org信息 -> 用户证书被注销则全部禁用？ -> 证书注销则全部的org都应该禁用
        let orgNameInThis;
        for (orgNameInThis of orgs) {
            // 更新 updated_config 中的crl信息 //TODO 这里的变量替换是否会生效
            // cat config.json | jq '.channel_group.groups.Application.groups.Org1MSP.values.MSP.value.config.revocation_list = ["'"${crl}"'"]' > updated_config.json
            updated_config.channel_group.groups.Application.groups.$(orgNameInThis).values.MSP.value.config.revocation_list=crl
            // TODO 大佬建议转换为字符串操作，先测试变量替换
        }

        // 获取新的pb
        updated_config_json = JSON.stringify(updated_config);
// lets get the updated JSON encoded
        response = await agent.post('http://127.0.0.1:7059/protolator/encode/common.Config',
            updated_config_json.toString())
            .buffer();
        console.log('Successfully encoded the updated config from the JSON input');
        updated_config_proto = response.body;

        const formData = {
            channel: CHANNEL_NAME,
            original: {
                value: original_config_proto,
                options: {
                    filename: 'original.proto',
                    contentType: 'application/octet-stream'
                }
            },
            updated: {
                value: updated_config_proto,
                options: {
                    filename: 'updated.proto',
                    contentType: 'application/octet-stream'
                }
            }
        };

        response = await new Promise((resolve, reject) => {
            requester.post({
                url: 'http://127.0.0.1:7059/configtxlator/compute/update-from-configs',
                formData: formData
            }, (err, res, body) => {
                if (err) {
                    console.log('Failed to get the updated configuration ::' + err);
                    reject(err);
                } else {
                    const proto = Buffer.from(body, 'binary');
                    resolve(proto);
                }
            });
        });
        console.log('Successfully had configtxlator compute the updated config object');
        config_proto = response;

        // will have to now collect the signatures
        signatures = []; // clear out the above
        // make sure we do not reuse the user
        client._userContext = null;


        // 收集签名信息
        // TODO 当前只有一个组织，所以也就只有一个ADMIN， 如果有多个组织， 则需要收集多个组织的ADMIN签名
        const gateway = await factory.getGateWay(ADMIN);
        const adminClient = gateway.getClient();

        signatures.push(adminClient.signChannelConfig(config_proto));


        /*// sign and collect signature
        signatures.push(client.signChannelConfig(config_proto));
        console.log('Successfully signed config update by org1');
        // make sure we do not reuse the user
        client._userContext = null;

        await testUtil.getSubmitter(client, t, true /!* get the org admin*!/, 'org2');
        console.log('Successfully enrolled user \'admin\' for org2');

        // sign and collect signature
        signatures.push(client.signChannelConfig(config_proto));
        console.log('Successfully signed config update by org2');

        // make sure we do not reuse the user
        client._userContext = null;
        await testUtil.getOrderAdminSubmitter(client, t);
        console.log('Successfully enrolled user \'admin\' for orderer (configtxlator 2)');

        // sign and collect signature
        signatures.push(client.signChannelConfig(config_proto));
        console.log('Successfully signed config update by orderer');*/

        // build up the create request

        const orderer = adminClient.getOrderer();

        request = {
            config: config_proto,
            signatures: signatures,
            name: CHANNEL_NAME,
            orderer: orderer,
            txId: client.newTransactionID()
        };

        // this will send the update request to the orderer
        var result;
        result = await client.updateChannel(request);
        if (result.status && result.status === 'SUCCESS') {
            console.log('Successfully updated the channel.');

        } else {
            console.log('Failed to update the channel. ');

            throw new Error('Failed to update the channel');
        }
        console.log('Successfully waited to make sure new channel was updated.');




    } catch (e) {
        console.log(Error("revokeUser Failure:"+e))
    }
}

module.exports = {deleteUser, register, enrollAdmin};
