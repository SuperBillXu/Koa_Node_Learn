'use strict';

const koa = require('koa');
const koa_jwt = require('koa-jwt');
const koa_bodyParser = require('koa-bodyparser');
const koa_router_controller = require('./koa_extensions/koa-router-controller');
const koa_nunjucks_controller = require('./koa_extensions/koa-nunjucks-controller');
const generic = require('./generic.json');

let app = new koa();

app.use(koa_bodyParser());
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});
app.use(koa_router_controller.publicDirectory('/dist'));
app.use(async (ctx, next) => {
    if (!ctx.request.url.match(/^\/api\//)) {
        ctx.response.status = 404;
        ctx.response.type = 'text/html';
        ctx.response.body = koa_nunjucks_controller.default.render('notfound_page.njk', {});
    }
    else {
        await next().catch((err) => {
            if (err.status === 401) {
                ctx.status = err.status;
                ctx.body = 'Protected resource, use Authorization header to get access\n';
            }
            else if (err.status === 404) {
                ctx.response.status = err.status;
                ctx.response.body = `Can't ${ctx.request.method} ${ctx.request.url}`;
            }
            else {
                throw err;
            }
        });
    }
});
app.use(koa_jwt({
    secret: generic.secretKey,
    getToken: ctx => ctx.request.query.token
}).unless({ path: /^\/api\/authorization/ }));
app.use(koa_router_controller.appendControllers('/api'));
app.listen(5001);
console.log('app started at port 5001...');

