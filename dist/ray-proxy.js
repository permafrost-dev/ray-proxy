var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = target => __defProp(target, '__esModule', { value: true });
var __exportStar = (target, module2, desc) => {
    if ((module2 && typeof module2 === 'object') || typeof module2 === 'function') {
        for (let key of __getOwnPropNames(module2))
            if (!__hasOwnProp.call(target, key) && key !== 'default')
                __defProp(target, key, {
                    get: () => module2[key],
                    enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable,
                });
    }
    return target;
};
var __toModule = module2 => {
    return __exportStar(
        __markAsModule(
            __defProp(
                module2 != null ? __create(__getProtoOf(module2)) : {},
                'default',
                module2 && module2.__esModule && 'default' in module2
                    ? { get: () => module2.default, enumerable: true }
                    : { value: module2, enumerable: true }
            )
        ),
        module2
    );
};

// src/index.ts
var import_axios = __toModule(require('axios'));

// src/classes/Counters.ts
var Counters = class {
    constructor() {
        this.totalBytesSent = 0;
        this.totalRequestCounter = 0;
        this.totalResponseTimeMs = 0;
        this.reset();
    }
    reset() {
        this.totalBytesSent = 0;
        this.totalRequestCounter = 0;
        this.totalResponseTimeMs = 0;
        return this;
    }
    onPayloadSent(payload) {
        this.totalBytesSent += payload.length;
        return this;
    }
    onRequestTime(requestTime) {
        this.totalResponseTimeMs += requestTime;
        return this;
    }
    onRequestSent() {
        this.totalRequestCounter += 1;
        return this;
    }
};

// src/lib/utils.ts
var formatPayloadSize = (bytes, decimals = 3) => {
    return Number((bytes / 1024).toFixed(decimals));
};
var relayResponseFromAppToClient = (fastifyReply, appResponse) => {
    const sentReply = fastifyReply.code(appResponse.status);
    for (const headerName in appResponse.headers) {
        sentReply.header(headerName, appResponse.headers[headerName]);
    }
    sentReply.send(appResponse.data);
};

// src/classes/EventHandlers.ts
var EventHandlers = class {
    onHead(config2, axios2) {
        return async (req, reply) => {
            let response;
            try {
                response = await axios2.head(`http://${config2.hostName}:${config2.hostPort}`);
            } catch (err) {
                response = err.response;
            }
            relayResponseFromAppToClient(reply, response);
        };
    }
    onOptions(config2, axios2) {
        return async (req, reply) => {
            const response = await axios2.options(`http://${config2.hostName}:${config2.hostPort}`);
            relayResponseFromAppToClient(reply, response);
        };
    }
    onPost(config2, axios2, requestCache, counters, logger) {
        return async (request, reply) => {
            var _a;
            requestCache.cache(request.id, new Date().getTime());
            const payload = JSON.stringify(request.body).toString();
            const response = await axios2.post(`http://${config2.hostName}:${config2.hostPort}`, request.body);
            relayResponseFromAppToClient(reply, response);
            const requestTime = new Date().getTime() - ((_a = requestCache.times[request.id]) != null ? _a : 0);
            counters.onRequestSent().onPayloadSent(payload).onRequestTime(requestTime);
            logger.display(requestTime, payload);
        };
    }
};

// src/classes/Logger.ts
var Logger = class {
    constructor(counters, requestCache) {
        this.counters = counters;
        this.requestCache = requestCache;
    }
    log(...args) {
        console.log(...args);
    }
    separator() {
        this.log('---');
    }
    logRayAppStats(requestTime) {
        const avgTime = (this.counters.totalResponseTimeMs / this.counters.totalRequestCounter).toFixed(1);
        this.log(`[Ray App] response time from Ray (last): ${requestTime} ms`);
        this.log(`[Ray App] response time from Ray (avg): ${avgTime} ms`);
    }
    logProjectStats() {
        this.log(`[project] requests/sec to Ray app: ${this.requestCache.requestsPerSec().toFixed(2)}`);
        this.log(`[payload] data sent (total): ${formatPayloadSize(this.counters.totalBytesSent)} kb`);
    }
    logPayloadStats(payload) {
        const avgRequestBytes = this.counters.totalBytesSent / this.counters.totalRequestCounter;
        this.log(`[payload] data sent (last payload): ${formatPayloadSize(payload.length)} kb`);
        this.log(`[payload] data sent (avg/request): ${formatPayloadSize(avgRequestBytes)} kb`);
    }
    logPayload(payload) {
        this.log('payload: ', payload);
    }
    display(requestTime, payload) {
        this.separator();
        this.logPayload(payload);
        this.separator();
        this.logRayAppStats(requestTime);
        this.logProjectStats();
        this.logPayloadStats(payload);
        this.separator();
    }
};

// src/classes/RequestCache.ts
var RequestCache = class {
    constructor() {
        this.countCache = [];
        this.times = {};
    }
    cache(requestId, currentTs = null, purgeOldItems = true) {
        this.times[requestId] = currentTs != null ? currentTs : new Date().getTime();
        currentTs = Number(((currentTs != null ? currentTs : new Date().getTime()) / 1e3).toFixed(0));
        this.countCache.push(currentTs);
        if (this.countCache.length > 3e3) {
            this.countCache.splice(0, this.countCache.length - 3e3);
        }
        if (purgeOldItems) {
            this.purgeCache(currentTs);
        }
    }
    requestsPerSec() {
        if (!this.countCache.length) {
            return 0;
        }
        const firstTs = this.countCache[0];
        const lastTs = this.countCache[this.countCache.length - 1];
        let elapsedTime = lastTs - firstTs;
        if (elapsedTime <= 0) {
            elapsedTime = 1;
        }
        return this.countCache.length / elapsedTime;
    }
    purgeCache(currentTs, maxAgeInSeconds = 5) {
        this.countCache = this.countCache.filter(ts => currentTs - ts <= maxAgeInSeconds);
    }
};

// src/Application.ts
var _Application = class {
    constructor(fastify2, config2, axios2, requestCache, counters, logger) {
        this.initialized = false;
        this.axios = axios2;
        this.fastify = fastify2;
        this.config = config2;
        this.requestCache = requestCache || new RequestCache();
        this.counters = counters || new Counters();
        this.logger = logger || new Logger(this.counters, this.requestCache);
        this.initialized = false;
        this.initEventHandlers();
        this.displayBanner();
    }
    displayBanner() {
        if (this.config.displayBanner) {
            this.logger.log(`
    ,---.,---.,   .   ,---.,---.,---..  ,,   .
    |    ,---||   |---|   ||    |   | >< |   |
    \`    \`---^\`---|   |---'\`    \`---''  \`\`---|
              \`---'   |                  \`---'
`);
        }
        this.logger.log(`Running ${_Application.NAME} v${_Application.VERSION}`);
        this.logger.log(`Proxy listening on local port ${this.config.proxyPort}`);
        this.logger.log(`Proxy forwarding to Ray host ${this.config.hostName}`);
        this.logger.log(`Proxy forwarding to Ray port ${this.config.hostPort}`);
    }
    initEventHandlers(axios2 = null, handlers = null) {
        axios2 = axios2 != null ? axios2 : this.axios;
        handlers = handlers != null ? handlers : new EventHandlers();
        if (!this.initialized) {
            this.fastify.post('/', handlers.onPost(this.config, axios2, this.requestCache, this.counters, this.logger));
            this.fastify.head('/', handlers.onHead(this.config, axios2));
            this.fastify.options('/', handlers.onOptions(this.config, axios2));
            this.initialized = true;
        }
    }
    exit(errCode = 0) {
        process.exit(errCode);
    }
    async start() {
        try {
            await this.fastify.listen(this.config.proxyPort);
        } catch (err) {
            this.fastify.log.error(err);
            this.exit(1);
        }
    }
};
var Application = _Application;
Application.VERSION = '0.2.2';
Application.NAME = 'ray-proxy';

// src/classes/ProxyConfig.ts
var import_fs = __toModule(require('fs'));
var defaultProxyConfigurationData = {
    hostName: 'localhost',
    hostPort: 23516,
    proxyPort: 23517,
    displayBanner: true,
};
var ProxyConfig = class {
    constructor(config2 = {}) {
        this.data = defaultProxyConfigurationData;
        this.useConfiguration(config2);
    }
    get hostName() {
        return this.data.hostName;
    }
    get hostPort() {
        return this.data.hostPort;
    }
    get proxyPort() {
        return this.data.proxyPort;
    }
    get displayBanner() {
        return this.data.displayBanner;
    }
    useConfiguration(config2) {
        this.data = Object.assign({}, defaultProxyConfigurationData, config2);
    }
    static loadFromFile(filename = null) {
        if (!filename) {
            filename = __dirname + '/ray-proxy.config.js';
        }
        if (!(0, import_fs.existsSync)(filename)) {
            console.log('config file not found, using defaults');
            return new ProxyConfig(defaultProxyConfigurationData);
        }
        let configData;
        try {
            configData = require(filename);
            return new ProxyConfig(configData);
        } catch (err) {
            console.log('Could not load config file:', err);
            throw err;
        }
    }
};

// src/index.ts
var fastify = require('fastify')({
    logger: true,
});
var config = ProxyConfig.loadFromFile();
var app = new Application(fastify, config, import_axios.default);
app.start();
