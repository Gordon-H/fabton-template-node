/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const {Contract, Context} = require('fabric-contract-api');

{{#each models}}
const {{name}}= require('./{{camelize name}}.js');
const {{name}}List = require('./{{camelize name}}List.js');
{{/each}}

class {{app}}Context extends Context {

    constructor() {
        super();
        {{#each models}}
        this.{{camelize name}}List = new {{name}}List(this)
        {{/each}}
    }
}

class {{app}}Contract extends Contract{

    constructor() {
        super("{{namespace}}");
    }

    createContext() {
        return new {{app}}Context();
    }

    async instantiate(ctx) {
        console.log('============= Instantiate the contract =============');
    }

    // ths init method is required，otherwise it cannot be deployed through Java SDK
    async init(ctx) {
        console.log('============= Init the contract ==============');
    }

    {{#each models}}
    async create{{name}}(ctx, str) {
        const o = JSON.parse(str)
        if (!(true{{#each keys}} && o.{{this}}{{/each}})) {
            throw new Error("The required field is not present")
        }
        let key = {{name}}.makeKey([{{#each keys}} o.{{this}},{{/each}}]);
        let item = await ctx.{{camelize name}}List.getState(key);
        if (item != null) {
            throw new Error("The item already exists")
        }
        item = {{name}}.createInstance({{#each keys}}o.{{this}},{{/each}}{{#each properties}}{{this}},{{/each}})
        await ctx.{{camelize name}}List.addState(item);
        return item.toBuffer();
    }

    async update{{name}}(ctx, {{#each keys}} {{this}},{{/each}} str) {
        const obj = JSON.parse(str);
        let key = {{name}}.makeKey([{{#each keys}} {{this}},{{/each}}]);
        let item = await ctx.{{camelize name}}List.getState(key);
        if (item == null) {
            throw new Error("The {{name}} doesn't exist")
        }
        Object.assign(item, obj);
        await ctx.{{camelize name}}List.updateState(item);
        return item.toBuffer();
    }

    async select{{name}}(ctx,{{#each keys}} {{this}},{{/each}} ) {
        let key = {{name}}.makeKey([{{#each keys}} {{this}},{{/each}}]);
        let item = await ctx.{{camelize name}}List.getState(key);
        if (item) {
            return item.toBuffer()
        } else {
            return null
        }
    }

    async delete{{name}}(ctx,{{#each keys}} {{this}},{{/each}} ) {
        let key = {{name}}.makeKey([{{#each keys}} {{this}},{{/each}}]);
        await ctx.{{camelize name}}List.deleteState(key);
        return "success";
    }

    {{/each}}

}

module.exports = {{app}}Contract;
