'use strict'

const koa = require('koa');
const koa_jwt = require('koa-jwt');
const koa_bodyParser = require('koa-bodyparser');
const koa_router_controller = require('./koa-router-controller');
const koa_nunjucks_controller = require('./koa-nunjucks-controller');
const generic = require('./generic.json');

let app = new koa();

app.use(koa_bodyParser());
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});
app.use(async (ctx, next) => {
    if (ctx.request.path === '/test') {
        ctx.response.body = koa_nunjucks_controller.default.render('test.njk', { username: "Hello Nunjucks!" });
    } else {
        await next();
    }
});
app.use(koa_router_controller.publicDirectory('/public'));
app.use(koa_jwt({
    secret: generic.secretKey,
    getToken: ctx => ctx.request.query.token
}).unless({ path: /^\/api\/authorization/ }));
app.use(koa_router_controller.appendControllers('/api'));
app.listen(5001);
console.log('app started at port 5001...');

