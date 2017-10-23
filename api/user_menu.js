const jwt = require('jsonwebtoken');
const generic = require('./../generic.json');
const koa_nunjucks_controller = require('./../koa_extensions/koa-nunjucks-controller');

let fn_user_menu = async (ctx, next) => {
    if (!ctx.state.user) {
        ctx.response.status = 404;
        await next();
        return;
    }

    let token = ctx.request.query.token || ctx.request.header.authorization || '';
    token = token.replace('Bearer ', '');
    let tokenInfo = token && jwt.decode(token, { secret: generic.secretKey });

    let menu = koa_nunjucks_controller.default.render("user_menu.njk", {
        username: tokenInfo.user,
        menuitems: [{ herf: "/user/" + tokenInfo.user + "?token=" + token, text: "Dashboard" },
        { id: "navbaritem-signout", text: "Sign out" }]
    });

    ctx.response.status = 200;
    ctx.response.type = 'application/json';
    ctx.response.body = {
        expired: Date.now() + 1440000,//1000*24*60
        menu: menu
    }
};

module.exports = { "GET /api/user_menu": fn_user_menu };