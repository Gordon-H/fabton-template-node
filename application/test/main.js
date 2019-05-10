const user = require('../service/user.js')
const affiliation= require('../service/affiliation.js')
const chaincode = require('../service/chaincode.js')

function test() {
    // user.enrollAdmin()
    // user.listOrg()
    // user.create('testorg')
    // affiliation.create('致链科技')
    user.register('致链科技', 'admin4medical')
    // user.revoke('testuser4')
    // user.deleteOrg('testorg')
    // chaincode.send('testuser3', 'query', 'iotchannel', 'iotLedger', 'selectAllDevices').then(res => {
    //     console.log('result = ' + JSON.stringify(res))
    // })
    // chaincode.send('testuser3', 'query', 'iotchannel', 'nodetest5', 'selectEngineer', 'ss').then(res => {
    //     console.log('result = ' + JSON.stringify(res))
    // })
    // chaincode.send('testuser3', 'query', 'medicalchannel', 'medicalLedger', 'selectEngineer', 'ss').then(res => {
    //     console.log('result = ' + JSON.stringify(res))
    // })

}

test()
