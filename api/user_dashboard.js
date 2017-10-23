const jwt = require('jsonwebtoken');
const generic = require('./../generic.json');
const DataManager = require('./../data/dataManager');
const koa_nunjucks_controller = require('./../koa_extensions/koa-nunjucks-controller');

let fn_user_dashboard = async (ctx, next) => {
    if (!ctx.state.user) {
        ctx.response.status = 404;
        await next();
        return;
    }

    let token = ctx.request.query.token || ctx.request.header.authorization || '';
    token = token.replace('Bearer ', '');
    let tokenInfo = token && jwt.decode(token, { secret: generic.secretKey });

    if (tokenInfo.user === ctx.params.name) {
        ctx.response.status = 200;
        ctx.response.type = 'text/html';
        ctx.response.body = koa_nunjucks_controller.default.render('user/dashboard.njk', {
            data: DataManager.getDefault().getAccountInfo()
        });
    }
    else {
        ctx.response.status = 401;
        await next();
    }
};

module.exports = { "GET /user/:name": fn_user_dashboard };