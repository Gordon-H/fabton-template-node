const {ADMIN, CH, CONTRACT, INVOKE, QUERY} = require("./constant")
const userSvc = require('./user.js')
const fileUtil = require('../util/fileutil')
const chaincodeSvc = require('./chaincode.js')
const affiliationSvc = require('./affiliation.js')
const Engineer = require('../../contract/lib/engineer.js');
const Institute = require('../../contract/lib/institute.js');
const Order = require('../../contract/lib/order.js');
const resputil = require('../util/resputil')


class Proxy {
    async selectOrder(orderId) {
        try {
            let res = await chaincodeSvc.send(ADMIN, QUERY, CH, CONTRACT, 'selectOrder', orderId)
            return parseResult(res, Order)
        } catch (error) {
            console.log(`========  Error select order. ${error}  =========`);
            console.log(error.stack);
            return resputil.fail(error.message)
        }
    }

    async createOrder(o) {
        try {
            let res = await chaincodeSvc.send(ADMIN, QUERY, CH, CONTRACT, 'selectEngineer', o.engineerIdNumber)
            if (res == null || res == '') {
                return resputil.fail("跟台员不存在！")
            }
            res = await chaincodeSvc.send(o.engineerIdNumber, INVOKE, CH, CONTRACT, 'createOrder', JSON.stringify(o))
            return parseResult(res, Order)
        } catch (error) {
            console.log(`========  Error create order. ${error}  =========`);
            console.log(error.stack);
            return resputil.fail(error.message)
        }
    }

    async updateOrderStatus(engineerIdNumber, orderId, status) {
        try {
            let res = await chaincodeSvc.send(engineerIdNumber, INVOKE, CH, CONTRACT, 'updateOrderStatus', orderId, status)
            return parseResult(res, Order)
        } catch (error) {
            console.log(`========  Error update order status. ${error}  =========`);
            console.log(error.stack);
            return resputil.fail(error.message)
        }
    }

    async selectEngineer(idNumber) {
        try {
            let res = await chaincodeSvc.send(ADMIN, QUERY, CH, CONTRACT, 'selectEngineer', idNumber)
            return parseResult(res, Engineer)
        } catch (error) {
            console.log(`========  Error select engineer. ${error}  =========`);
            console.log(error.stack);
            return resputil.fail(error.message)
        }
    }

    async createOrUpdateEngineer(o) {
        if (o.idFrontPicUrl) {
            o.idFrontPicHash = await fileUtil.calFileHash(o.idFrontPicUrl)
        }
        if (o.idBackPicUrl) {
            o.idBackPicHash = await fileUtil.calFileHash(o.idBackPicUrl)
        }
        let res = await chaincodeSvc.send(ADMIN, QUERY, CH, CONTRACT, 'selectEngineer', o.idNumber)
        if (res == null || res == '') {
            return await this.createEngineer(o)
        } else {
            const engineer = Engineer.fromBuffer(res)
            console.log('old engineer :' + JSON.stringify(engineer))
            if (o.education) {
                Object.assign(o.education, engineer.education)
            }
            if (o.credentials) {
                Object.assign(o.credentials, engineer.credentials)
            }
            console.log('update engineer = ' + JSON.stringify(o))
            return await this.updateEngineer(o.idNumber, o)
        }
    }

    async createEngineer(o) {
        try {
            let res, org
            if (o.socialNum) {
                res = await chaincodeSvc.send(ADMIN, QUERY, CH, CONTRACT, 'selectInstitute', o.socialNum);
                if (res == null || res == '') {
                    return resputil.fail("企业机构不存在！")
                }
                const institute = Institute.deserialize(res)
                console.log('institute:' + JSON.stringify(institute))
                org = institute.socialNum
            } else {
                org = 'common'
            }
            // 注册用户
            await userSvc.register(org, o.idNumber)
            console.log('------------  engineer new --------------')
            res = await chaincodeSvc.send(ADMIN, INVOKE, CH, CONTRACT, 'createEngineer', JSON.stringify(o))
            return parseResult(res, Engineer)
        } catch (error) {
            if (error.toString().includes("The required field is not present")) {
                console.log("用户注册失败，回滚中...")
                userSvc.deleteUser(o.idNumber)
            }
            console.log(`========  Error create engineer. ${error}  =========`);
            console.log(error.stack);
            return resputil.fail(error.message)
        }
    }

    async updateEngineer(idNumber, o) {
        try {
            let res;
            if (o.socialNum) {
                let res = await chaincodeSvc.send(ADMIN, QUERY, CH, CONTRACT, 'selectInstitute', o.socialNum);
                res = res.toString();
                if (res == null || res === '') {
                    return resputil.fail("企业机构不存在！")
                }
            }

            // for (let k in o) {
            //     if (o[k] === null || o[k] === '') {
            //         delete o[k]
            //     }
            // }

            res = await chaincodeSvc.send(idNumber, INVOKE, CH, CONTRACT, 'updateEngineer', idNumber, JSON.stringify(o))
            return parseResult(res, Engineer)
        } catch (error) {
            console.log(`========  Error update engineer. ${error}  =========`);
            console.log(error.stack);
            return resputil.fail(error.message)
        }
    }

    async deleteEngineer(idNumber) {
        try {
            let res = await chaincodeSvc.send(idNumber, INVOKE, CH, CONTRACT, 'deleteEngineer', idNumber)
            await userSvc.deleteUser(idNumber)
            return resputil.success(res.toString())
        } catch (error) {
            console.log(`========  Error delete engineer. ${error}  =========`)
            console.log(error.stack)
            return resputil.fail(error.message)
        }
    }

    async selectInstitute(socialNum) {
        try {
            let res = await chaincodeSvc.send(ADMIN, QUERY, CH, CONTRACT, 'selectInstitute', socialNum)
            return parseResult(res, Institute)
        } catch (error) {
            console.log(`========  Error select institute. ${error}  =========`);
            console.log(error.stack);
            return resputil.fail(error.message)
        }
    }
    async createInstitute(o) {
        try {
            await affiliationSvc.create(o.socialNum)
            if (o.businessLicencePicUrl) {
                o.businessLicencePicHash = await fileUtil.calFileHash(o.businessLicencePicUrl)
            }
            console.log('request string:'+JSON.stringify(o))
            let res = await chaincodeSvc.send(ADMIN, INVOKE, CH, CONTRACT, 'createInstitute', JSON.stringify(o))
            return parseResult(res, Institute)
        } catch (error) {
            console.log(`========  Error create institute . ${error}  =========`);
            console.log(error.stack);
            affiliationSvc.deleteOrg(o.socialNum)
            return resputil.fail(error.message)
        }
    }

    async updateInstitute(socialNum, o) {
        try {
            // 删除空值（如果有）
            for (let k in o) {
                if (o[k] === null || o[k] === '') {
                    delete o[k]
                }
            }
            if (o.businessLicencePicUrl) {
                o.businessLicencePicHash = await fileUtil.calFileHash(o.businessLicencePicUrl)
            }

            let res = await chaincodeSvc.send(ADMIN, INVOKE, CH, CONTRACT, 'updateInstitute', socialNum, JSON.stringify(o))
            return parseResult(res, Institute)
        } catch (error) {
            console.log(`========  Error update institute. ${error}  =========`);
            console.log(error.stack);
            return resputil.fail(error.message)
        }
    }

    async deleteInstitute(socialNum) {
        try {
            await affiliationSvc.deleteOrg(socialNum)
            let res = await chaincodeSvc.send(ADMIN, INVOKE, CH, CONTRACT, 'deleteInstitute', socialNum)
            return resputil.success(res.toString())
        } catch (error) {
            console.log(`========  Error delete engineer. ${error}  =========`);
            console.log(error.stack);
            return resputil.fail(error.message)
        }
    }

}

function parseResult(res, clazz) {
    let item = {}
    if (res != '') {
        item = clazz.fromBuffer(res)
    }
    return resputil.success(item)
}

function newProxy() {
    return new Proxy()
}

module.exports = {newProxy};
