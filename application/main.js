'use strict';

const swaggerUi = require('swagger-ui-express');
const express = require('express');
const bodyParser = require('body-parser');
const svcProxy = require('./router/proxy.js');
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
    app.use('/', indexRouter);
    app.use('/api/users', usersRouter);
    const server = app.listen(3000, function () {
        console.log('listening on port %d', server.address().port);
    });
}

main()
