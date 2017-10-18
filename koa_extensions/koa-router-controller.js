const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));
const koa_router = require('koa-router');
const rootdir = path.dirname(require.main.filename);
const responsTypeDict = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".ico": "image/x-icon"
};


function appendControllers(directory) {
    let result_router = koa_router();
    let files = fs.readdirSync(path.join(rootdir, directory));
    let jsFiles = files.filter(f => f.endsWith('.js'));

    for (let jsFile of jsFiles) {
        console.log(`loading ${jsFile}...`);
        let controller = require(path.join(rootdir, directory, jsFile));
        loadRouteController(controller, result_router);
    }

    return result_router.routes();
}

function loadRouteController(controller, router) {
    let supportMethods = {
        'GET': router.get,
        'POST': router.post
    };

    for (let api in controller) {
        let method, route;
        for (let methodName in supportMethods) {
            if (api.startsWith(methodName)) {
                route = api.substring(methodName.length + 1);
                method = methodName;
                break;
            }
        }
        supportMethods[method].call(router, route, controller[api]);
        console.log(`register URL mapping: ${method} ${route}`);
    }
}

let fn_public = function (file, responsType) {
    return async (ctx, next) => {
        let data = await fs.readFileAsync(file);
        if (data) {
            ctx.response.type = responsType;
            ctx.status = 200;
            ctx.response.body = data;
        }
        else {
            ctx.status = 404;
        }
    };
}

function publicDirectory(directory) {
    let requestType = {};
    return async (ctx, next) => {
        let localDirectory = path.join(rootdir, directory);
        let file = path.join(localDirectory, ctx.request.url);
        if (!fs.existsSync(file)) {
            await next();
            return;
        }
        if (fs.statSync(file).isDirectory()) {
            file = path.join(file, 'index.html');
        }
        if (!fs.existsSync(file)) {
            await next();
            return;
        }

        let extname = path.extname(file).toLowerCase();
        let responsType = responsTypeDict.hasOwnProperty(extname) ? responsTypeDict[extname] : 'text/plain';
        let data = await fs.readFileAsync(file);
        ctx.response.type = responsType;
        ctx.status = 200;
        ctx.response.body = data;
    };
}

module.exports = {
    "appendControllers": appendControllers,
    "publicDirectory": publicDirectory
}