const DataManager = require('./../data/dataManager');

let fn_account = async (ctx, next) => {
    if (ctx.state.user) {
        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = DataManager.getDefault().getAccountInfo();
    }
    else {
        ctx.response.status = 401;
        await next();
    }
};

module.exports = { "GET /api/account": fn_account };