const jwt = require('jsonwebtoken');
const generic = require('./../generic.json');
const koa_nunjucks_controller = require('./../koa-nunjucks-controller');

let fn_user_menu = async (ctx, next) => {
    let token = ctx.request.query.token || ctx.request.header.authorization || '';
    token = token.replace('Bearer ', '');
    let tokenInfo = token && jwt.decode(token, { secret: generic.secretKey });

    ctx.response.status = 200;
    ctx.response.type = 'text/html';
    ctx.response.body = koa_nunjucks_controller.default.render("user_menu.njk", {
        username: tokenInfo.user,
        menuitems: [{ herf: "/user/dashboard.html", text: "Dashboard" },
        { herf: "#", text: "Sign out" }]
    });
};

module.exports = { "GET /api/user_menu": fn_user_menu };