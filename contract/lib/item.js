/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const State = require('./../ledger-api/state.js');


class {{name}} extends State {

    constructor(obj) {
        super({{name}}.getClass(), [{{#each keys}}obj.{{this}},{{/each}}]);
        Object.assign(this, obj);
    }

    static fromBuffer(buffer) {
        return {{name}}.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, {{name}});
    }

    static createInstance({{#each keys}}{{this}},{{/each}}{{#each properties}}{{this}},{{/each}}) {
        return new {{name}}({
            {{#each keys}}{{this}},{{/each}}
            {{#each properties}}{{this}},{{/each}}
        });
    }

    static getClass() {
        return "{{namespace}}";
    }
}

module.exports = {{name}};
