let fn_account = async (ctx, next) => {
    ctx.response.status = 200;
    ctx.response.type = 'application/json';
    ctx.response.body = {
        age: '25',
        skill: 'Csharp,NodeJs,Jquery',
        sex: 'Male'
    }
};

module.exports = { "GET /api/account": fn_account };