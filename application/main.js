'use strict';

const swaggerUi = require('swagger-ui-express');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
{{#each models}}
const {{camelize name}}Router = require('./router/{{camelize name}}.js');
{{/each}}

const swaggerDocument = require('./swagger.json');

let app = express();

function main() {
    app.use(bodyParser.json());
    // app.use(bodyParser.urlencoded({extended: true}));
    app.use(compression());
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument)
    );
    {{#each models}}
    app.use('/api/{{camelize name}}', {{camelize name}}Router);
    {{/each}}

    const port = process.env.PORT || 3000;
    const server = app.listen(port, function () {
        console.log('listening on port %d', server.address().port);
    });
}

main()
