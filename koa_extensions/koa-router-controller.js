const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));
const koa_router = require('koa-router');
const rootdir = path.dirname(require.main.filename);

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

function publicDirectory(directory, route, router) {
    let result = {};
    let localDirectory = path.join(rootdir, directory);
    let files = fs.readdirSync(localDirectory);

    route = route || '';
    router = router || koa_router();

    for (let file of files) {
        let extname = path.extname(file).toLowerCase();
        let localFile = path.join(localDirectory, file);
        if (fs.statSync(localFile).isDirectory()) {
            publicDirectory(`${directory}/${file}`, `${route}/${file}`, router);
            continue;
        }

        if (extname === '.html') {
            result[`GET ${route}/${file}`] = fn_public(localFile, 'text/html');
        }
        else if (extname === '.js') {
            result[`GET ${route}/${file}`] = fn_public(localFile, 'text/javascript');
        }
        else if (extname === '.css') {
            result[`GET ${route}/${file}`] = fn_public(localFile, 'text/css');
        }
        else if (extname === '.ico') {
            result[`GET ${route}/${file}`] = fn_public(localFile, 'image/x-icon');
        }
        else {
            result[`GET ${route}/${file}`] = fn_public(localFile, 'text/plain');
        }
    }
    result['GET /index.html'] && (result['GET /'] = result['GET /index.html']);

    loadRouteController(result, router);
    return router.routes();
}

module.exports = {
    "appendControllers": appendControllers,
    "publicDirectory": publicDirectory
}