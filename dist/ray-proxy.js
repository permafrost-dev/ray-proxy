var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => {
  return {
    set _(value) {
      __privateSet(obj, member, value, setter);
    },
    get _() {
      return __privateGet(obj, member, getter);
    }
  };
};

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
__name(Counters, "Counters");

// src/lib/utils.ts
var formatPayloadSize = /* @__PURE__ */ __name((bytes, decimals = 3) => {
  return Number((bytes / 1024).toFixed(decimals));
}, "formatPayloadSize");
var relayResponseFromAppToClient = /* @__PURE__ */ __name((fastifyReply, appResponse, reflectHeaders = true) => {
  var _a;
  if (typeof appResponse === "undefined") {
    const sentReply2 = fastifyReply.code(404);
    sentReply2.header("Access-Control-Allow-Origin", "*");
    sentReply2.send("not found");
    return;
  }
  const sentReply = fastifyReply.code((_a = appResponse == null ? void 0 : appResponse.status) != null ? _a : 404);
  if (reflectHeaders) {
    sentReply.headers(appResponse.headers);
  }
  sentReply.header("connection", "keep-alive");
  setCorsHeaders(sentReply);
  sentReply.send(appResponse.data);
}, "relayResponseFromAppToClient");
var setCorsHeaders = /* @__PURE__ */ __name((reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range");
  reply.header("Access-Control-Expose-Headers", "Content-Length,Content-Range");
}, "setCorsHeaders");
var sendPreflightCorsResponse = /* @__PURE__ */ __name((fastifyReply) => {
  const sentReply = fastifyReply.code(204);
  setCorsHeaders(sentReply);
  sentReply.header("Access-Control-Max-Age", 3600 * 24);
  sentReply.header("Content-Type", "text/plain; charset=utf-8");
  sentReply.send("");
}, "sendPreflightCorsResponse");

// src/classes/EventHandlers.ts
var EventHandlers = class {
  onHead(config, axios2) {
    return async (req, reply) => {
      let response;
      try {
        response = await axios2.head(`http://${config.hostName}:${config.hostPort}`);
      } catch (err) {
        response = err.response;
      }
      relayResponseFromAppToClient(reply, response);
    };
  }
  onGet(config, axios2) {
    return async (req, reply) => {
      let response;
      try {
        response = await axios2.get(`${req.url}`);
      } catch (err) {
        response = err.response;
      }
      relayResponseFromAppToClient(reply, response);
    };
  }
  onOptions(config, axios2) {
    return async (req, reply) => {
      sendPreflightCorsResponse(reply);
    };
  }
  onPost(config, axios2, requestCache, counters, logger) {
    return async (request, reply) => {
      var _a;
      let response;
      requestCache.cache(request.id, new Date().getTime());
      const payload = JSON.stringify(request.body).toString();
      try {
        response = await axios2.post(`http://${config.hostName}:${config.hostPort}`, request.body);
      } catch (err) {
        response = err.response;
      }
      relayResponseFromAppToClient(reply, response);
      const requestTime = new Date().getTime() - ((_a = requestCache.times[request.id]) != null ? _a : 0);
      counters.onRequestSent().onPayloadSent(payload).onRequestTime(requestTime);
      logger.display(requestTime, payload);
    };
  }
};
__name(EventHandlers, "EventHandlers");

// src/classes/Logger.ts
var Logger = class {
  constructor(counters, requestCache, logger = null) {
    this.logger = logger != null ? logger : console;
    this.counters = counters;
    this.requestCache = requestCache;
  }
  log(...args) {
    this.logger.log(...args);
  }
  separator() {
    this.log("---");
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
    this.log("payload: ", payload);
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
__name(Logger, "Logger");

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
    this.countCache = this.countCache.filter((ts) => currentTs - ts <= maxAgeInSeconds);
  }
};
__name(RequestCache, "RequestCache");

// src/Application.ts
var _Application = class {
  constructor(fastify, config, axios2, requestCache, counters, logger) {
    this.initialized = false;
    this.axios = axios2;
    this.fastify = fastify;
    this.config = config;
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
      this.fastify.post("/", handlers.onPost(this.config, axios2, this.requestCache, this.counters, this.logger));
      this.fastify.get("/locks/*", handlers.onGet(this.config, axios2));
      this.fastify.get("/*", handlers.onGet(this.config, axios2));
      this.fastify.head("/", handlers.onHead(this.config, axios2));
      this.fastify.options("/", handlers.onOptions(this.config, axios2));
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
__name(Application, "Application");
Application.VERSION = "0.4.0";
Application.NAME = "ray-proxy";

// src/classes/ProxyConfig.ts
var import_fs = require("fs");

// node_modules/find-up/index.js
var import_node_path2 = __toESM(require("path"), 1);
var import_node_url2 = require("url");

// node_modules/locate-path/index.js
var import_node_process = __toESM(require("process"), 1);
var import_node_path = __toESM(require("path"), 1);
var import_node_fs = __toESM(require("fs"), 1);
var import_node_url = require("url");

// node_modules/yocto-queue/index.js
var Node = class {
  value;
  next;
  constructor(value) {
    this.value = value;
  }
};
__name(Node, "Node");
var _head, _tail, _size;
var Queue = class {
  constructor() {
    __privateAdd(this, _head, void 0);
    __privateAdd(this, _tail, void 0);
    __privateAdd(this, _size, void 0);
    this.clear();
  }
  enqueue(value) {
    const node = new Node(value);
    if (__privateGet(this, _head)) {
      __privateGet(this, _tail).next = node;
      __privateSet(this, _tail, node);
    } else {
      __privateSet(this, _head, node);
      __privateSet(this, _tail, node);
    }
    __privateWrapper(this, _size)._++;
  }
  dequeue() {
    const current = __privateGet(this, _head);
    if (!current) {
      return;
    }
    __privateSet(this, _head, __privateGet(this, _head).next);
    __privateWrapper(this, _size)._--;
    return current.value;
  }
  clear() {
    __privateSet(this, _head, void 0);
    __privateSet(this, _tail, void 0);
    __privateSet(this, _size, 0);
  }
  get size() {
    return __privateGet(this, _size);
  }
  *[Symbol.iterator]() {
    let current = __privateGet(this, _head);
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
};
__name(Queue, "Queue");
_head = new WeakMap();
_tail = new WeakMap();
_size = new WeakMap();

// node_modules/locate-path/index.js
var typeMappings = {
  directory: "isDirectory",
  file: "isFile"
};
function checkType(type) {
  if (type in typeMappings) {
    return;
  }
  throw new Error(`Invalid type specified: ${type}`);
}
__name(checkType, "checkType");
var matchType = /* @__PURE__ */ __name((type, stat) => type === void 0 || stat[typeMappings[type]](), "matchType");
var toPath = /* @__PURE__ */ __name((urlOrPath) => urlOrPath instanceof URL ? (0, import_node_url.fileURLToPath)(urlOrPath) : urlOrPath, "toPath");
function locatePathSync(paths, {
  cwd = import_node_process.default.cwd(),
  type = "file",
  allowSymlinks = true
} = {}) {
  checkType(type);
  cwd = toPath(cwd);
  const statFunction = allowSymlinks ? import_node_fs.default.statSync : import_node_fs.default.lstatSync;
  for (const path_ of paths) {
    try {
      const stat = statFunction(import_node_path.default.resolve(cwd, path_));
      if (matchType(type, stat)) {
        return path_;
      }
    } catch {
    }
  }
}
__name(locatePathSync, "locatePathSync");

// node_modules/find-up/index.js
var toPath2 = /* @__PURE__ */ __name((urlOrPath) => urlOrPath instanceof URL ? (0, import_node_url2.fileURLToPath)(urlOrPath) : urlOrPath, "toPath");
var findUpStop = Symbol("findUpStop");
function findUpMultipleSync(name, options = {}) {
  let directory = import_node_path2.default.resolve(toPath2(options.cwd) || "");
  const { root } = import_node_path2.default.parse(directory);
  const stopAt = options.stopAt || root;
  const limit = options.limit || Number.POSITIVE_INFINITY;
  const paths = [name].flat();
  const runMatcher = /* @__PURE__ */ __name((locateOptions) => {
    if (typeof name !== "function") {
      return locatePathSync(paths, locateOptions);
    }
    const foundPath = name(locateOptions.cwd);
    if (typeof foundPath === "string") {
      return locatePathSync([foundPath], locateOptions);
    }
    return foundPath;
  }, "runMatcher");
  const matches = [];
  while (true) {
    const foundPath = runMatcher(__spreadProps(__spreadValues({}, options), { cwd: directory }));
    if (foundPath === findUpStop) {
      break;
    }
    if (foundPath) {
      matches.push(import_node_path2.default.resolve(directory, foundPath));
    }
    if (directory === stopAt || matches.length >= limit) {
      break;
    }
    directory = import_node_path2.default.dirname(directory);
  }
  return matches;
}
__name(findUpMultipleSync, "findUpMultipleSync");
function findUpSync(name, options = {}) {
  const matches = findUpMultipleSync(name, __spreadProps(__spreadValues({}, options), { limit: 1 }));
  return matches[0];
}
__name(findUpSync, "findUpSync");

// src/classes/ProxyConfig.ts
var defaultProxyConfigurationData = {
  hostName: "localhost",
  hostPort: 23516,
  proxyPort: 23517,
  displayBanner: true
};
var ProxyConfig = class {
  constructor(config = {}) {
    this.data = defaultProxyConfigurationData;
    this.useConfiguration(config);
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
  useConfiguration(config) {
    this.data = Object.assign({}, defaultProxyConfigurationData, config);
  }
  static loadFromFile(filename = null) {
    if (!filename) {
      filename = findUpSync("ray-proxy.config.js") || null;
      if (filename === void 0) {
        filename = __dirname + "/ray-proxy.config.js";
      }
    }
    if (filename === null || !(0, import_fs.existsSync)(filename)) {
      console.log("config file not found, using defaults");
      return new ProxyConfig(defaultProxyConfigurationData);
    }
    let configData;
    try {
      configData = require(filename);
      return new ProxyConfig(configData);
    } catch (err) {
      console.log("Could not load config file:", err);
      throw err;
    }
  }
};
__name(ProxyConfig, "ProxyConfig");

// src/index.ts
var import_axios = __toESM(require("axios"));
var import_fastify = __toESM(require("fastify"));
async function main() {
  const fastify = (0, import_fastify.default)({
    logger: true
  });
  const config = ProxyConfig.loadFromFile();
  const app = new Application(fastify, config, import_axios.default);
  return app.start();
}
__name(main, "main");
main();
