const {INVOKE, QUERY} = require("../constant")
const config = require("../fabric-config")
const chaincodeSvc = require('../lib/chaincode.js')
const resputil = require('../util/resputil')

const express = require('express');
const router = express.Router();
const {{name}}= require('../../contract/lib/{{camelize name}}.js');

const ADMIN = config.defaultUser
const CH = config.channel
const CONTRACT =config.contract

router.get('{{#each keys}}/:{{this}}{{/each}}', function (req, res) {
    select{{name}}(req.params).then((r) => {
        res.send(r);
    })
});
router.post('/', function (req, res) {
    create{{name}}(req.body).then((r) => {
        res.send(r);
    })
});
router.delete('{{#each keys}}/:{{this}}{{/each}}', function (req, res) {
    delete{{name}}(req.params).then((r) => {
        res.send(r);
    })
});
router.put('{{#each keys}}/:{{this}}{{/each}}', function (req, res) {
    update{{name}}(req.params, req.body).then((r) => {
        res.send(r);
    })
});

async function select{{name}}(params) {
    try {
        let res = await chaincodeSvc.send(ADMIN, QUERY, CH, CONTRACT, 'select{{name}}', {{#each keys}}params.{{this}},{{/each}})
        return parseResult(res, {{name}})
    } catch (error) {
        console.log(`========  Error select {{name}}. ${error}  =========`);
        console.log(error.stack);
        return resputil.fail(error.message)
    }
}

async function create{{name}}(o) {
    try {
        let res = await chaincodeSvc.send(ADMIN, INVOKE, CH, CONTRACT, 'create{{name}}', JSON.stringify(o))
        return parseResult(res, {{name}})
    } catch (error) {
        console.log(`========  Error create {{name}}. ${error}  =========`);
        console.log(error.stack);
        return resputil.fail(error.message)
    }
}

async function update{{name}}(params, o) {
    try {
        let res = await chaincodeSvc.send(ADMIN, INVOKE, CH, CONTRACT, 'update{{name}}', {{#each keys}}params.{{this}},{{/each}} JSON.stringify(o))
        return parseResult(res, {{name}})
    } catch (error) {
        console.log(`========  Error update {{name}}. ${error}  =========`);
        console.log(error.stack);
        return resputil.fail(error.message)
    }
}

async function delete{{name}}(params) {
    try {
        let res = await chaincodeSvc.send(ADMIN, INVOKE, CH, CONTRACT, 'delete{{name}}', {{#each keys}}params.{{this}},{{/each}})
        return resputil.success(res.toString())
    } catch (error) {
        console.log(`========  Error delete {{name}}. ${error}  =========`)
        console.log(error.stack)
        return resputil.fail(error.message)
    }
}

function parseResult(res, clazz) {
    let item = {}
    if (res != '') {
        item = clazz.fromBuffer(res)
    }
    return resputil.success(item)
}

module.exports = router;
