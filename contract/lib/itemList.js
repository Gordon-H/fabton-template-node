/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';


// Utility class for collections of ledger states --  a state list
const StateList = require('./../ledger-api/statelist.js');

const {{name}}= require('./{{camelize name}}.js');

class {{name}}List extends StateList {

    constructor(ctx) {
        super(ctx, {{name}}.getClass());
        this.use({{name}});
    }
}


module.exports = {{name}}List;
