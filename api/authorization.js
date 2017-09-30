const jwt = require('jsonwebtoken');
const generic = require('./../generic.json');

let fn_authorization = async (ctx, next) => {
    let userName = ctx.request.body.name || '';
    let password = ctx.request.body.password || '';
    console.log(`User name: ${userName}, Password: ${password}`);
    if (userName === 'bill' && password === 'bkeyxmon1') {
        let userToken = jwt.sign({ user: 'bill' }, generic.secretKey, {
            expiresIn: 60 * 60 * 24,                        
        })

        ctx.response.status = 200;
        ctx.response.type = 'application/json';
        ctx.response.body = {
            user: 'bill',
            token: userToken
        }
    }
    else {
        ctx.response.status = 401;
    }
};

module.exports = { "POST /api/authorization": fn_authorization };