'use strict';

const swaggerUi = require('swagger-ui-express');
const express = require('express');
const bodyParser = require('body-parser');
const svcProxy = require('./service/proxy.js');
const compression = require('compression');

const swaggerDocument = require('./swagger.json');

let app = express();
let proxy = svcProxy.newProxy();

function main() {
    app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({extended: true}));
    app.use(compression());
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument)
    );
    app.post('/api/order', function (req, res) {
        proxy.createOrder(req.body)
            .then(resp => res.send(resp));
    });
    app.get('/api/order/:orderId', function (req, res) {
        proxy.selectOrder(req.params.orderId)
            .then(resp => res.send(resp));
    });
    app.put('/api/order/:orderId', function (req, res) {
        proxy.updateOrderStatus(req.body.engineerIdNumber, req.params.orderId, req.body.status)
            .then(resp => res.send(resp));
    });
    app.get('/api/engineer/:idNumber', function (req, res) {
        proxy.selectEngineer(req.params.idNumber)
            .then(resp => res.send(resp));
    });
    app.post('/api/engineer', function (req, res) {
        proxy.createOrUpdateEngineer(req.body)
            .then(resp => res.send(resp));
    });
    app.delete('/api/engineer/:idNumber', function (req, res) {
        proxy.deleteEngineer(req.params.idNumber)
            .then(resp => res.send(resp));
    });
    app.get('/api/institute/:socialNum', function (req, res) {
        proxy.selectInstitute(req.params.socialNum)
            .then(resp => res.send(resp));
    });
    app.post('/api/institute', function (req, res) {
        proxy.createInstitute(req.body)
            .then(resp => res.send(resp));
    });
    app.put('/api/institute/:socialNum', function (req, res) {
        proxy.updateInstitute(req.params.socialNum, req.body)
            .then(resp => res.send(resp));
    });
    app.delete('/api/institute/:socialNum', function (req, res) {
        proxy.deleteInstitute(req.params.socialNum)
            .then(resp => res.send(resp));
    });
    const server = app.listen(3000, function () {
        console.log('listening on port %d', server.address().port);
    });
}

main()
