var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module2) => () => {
  if (!module2) {
    module2 = {exports: {}};
    callback(module2.exports, module2);
  }
  return module2.exports;
};
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// node_modules/yocto-queue/index.js
var require_yocto_queue = __commonJS((exports2, module2) => {
  var Node = class {
    constructor(value) {
      this.value = value;
      this.next = void 0;
    }
  };
  var Queue = class {
    constructor() {
      this.clear();
    }
    enqueue(value) {
      const node = new Node(value);
      if (this._head) {
        this._tail.next = node;
        this._tail = node;
      } else {
        this._head = node;
        this._tail = node;
      }
      this._size++;
    }
    dequeue() {
      const current = this._head;
      if (!current) {
        return;
      }
      this._head = this._head.next;
      this._size--;
      return current.value;
    }
    clear() {
      this._head = void 0;
      this._tail = void 0;
      this._size = 0;
    }
    get size() {
      return this._size;
    }
    *[Symbol.iterator]() {
      let current = this._head;
      while (current) {
        yield current.value;
        current = current.next;
      }
    }
  };
  module2.exports = Queue;
});

// node_modules/p-limit/index.js
var require_p_limit = __commonJS((exports2, module2) => {
  "use strict";
  var Queue = require_yocto_queue();
  var pLimit = (concurrency) => {
    if (!((Number.isInteger(concurrency) || concurrency === Infinity) && concurrency > 0)) {
      throw new TypeError("Expected `concurrency` to be a number from 1 and up");
    }
    const queue = new Queue();
    let activeCount = 0;
    const next = () => {
      activeCount--;
      if (queue.size > 0) {
        queue.dequeue()();
      }
    };
    const run = async (fn, resolve, ...args) => {
      activeCount++;
      const result = (async () => fn(...args))();
      resolve(result);
      try {
        await result;
      } catch {
      }
      next();
    };
    const enqueue = (fn, resolve, ...args) => {
      queue.enqueue(run.bind(null, fn, resolve, ...args));
      (async () => {
        await Promise.resolve();
        if (activeCount < concurrency && queue.size > 0) {
          queue.dequeue()();
        }
      })();
    };
    const generator = (fn, ...args) => new Promise((resolve) => {
      enqueue(fn, resolve, ...args);
    });
    Object.defineProperties(generator, {
      activeCount: {
        get: () => activeCount
      },
      pendingCount: {
        get: () => queue.size
      },
      clearQueue: {
        value: () => {
          queue.clear();
        }
      }
    });
    return generator;
  };
  module2.exports = pLimit;
});

// node_modules/p-locate/index.js
var require_p_locate = __commonJS((exports2, module2) => {
  "use strict";
  var pLimit = require_p_limit();
  var EndError = class extends Error {
    constructor(value) {
      super();
      this.value = value;
    }
  };
  var testElement = async (element, tester) => tester(await element);
  var finder = async (element) => {
    const values = await Promise.all(element);
    if (values[1] === true) {
      throw new EndError(values[0]);
    }
    return false;
  };
  var pLocate = async (iterable, tester, options) => {
    options = {
      concurrency: Infinity,
      preserveOrder: true,
      ...options
    };
    const limit = pLimit(options.concurrency);
    const items = [...iterable].map((element) => [element, limit(testElement, element, tester)]);
    const checkLimit = pLimit(options.preserveOrder ? 1 : Infinity);
    try {
      await Promise.all(items.map((element) => checkLimit(finder, element)));
    } catch (error) {
      if (error instanceof EndError) {
        return error.value;
      }
      throw error;
    }
  };
  module2.exports = pLocate;
});

// node_modules/locate-path/index.js
var require_locate_path = __commonJS((exports2, module2) => {
  "use strict";
  var path = require("path");
  var fs = require("fs");
  var {promisify} = require("util");
  var pLocate = require_p_locate();
  var fsStat = promisify(fs.stat);
  var fsLStat = promisify(fs.lstat);
  var typeMappings = {
    directory: "isDirectory",
    file: "isFile"
  };
  function checkType({type}) {
    if (type in typeMappings) {
      return;
    }
    throw new Error(`Invalid type specified: ${type}`);
  }
  var matchType = (type, stat) => type === void 0 || stat[typeMappings[type]]();
  module2.exports = async (paths, options) => {
    options = {
      cwd: process.cwd(),
      type: "file",
      allowSymlinks: true,
      ...options
    };
    checkType(options);
    const statFn = options.allowSymlinks ? fsStat : fsLStat;
    return pLocate(paths, async (path_) => {
      try {
        const stat = await statFn(path.resolve(options.cwd, path_));
        return matchType(options.type, stat);
      } catch {
        return false;
      }
    }, options);
  };
  module2.exports.sync = (paths, options) => {
    options = {
      cwd: process.cwd(),
      allowSymlinks: true,
      type: "file",
      ...options
    };
    checkType(options);
    const statFn = options.allowSymlinks ? fs.statSync : fs.lstatSync;
    for (const path_ of paths) {
      try {
        const stat = statFn(path.resolve(options.cwd, path_));
        if (matchType(options.type, stat)) {
          return path_;
        }
      } catch {
      }
    }
  };
});

// node_modules/path-exists/index.js
var require_path_exists = __commonJS((exports2, module2) => {
  "use strict";
  var fs = require("fs");
  var {promisify} = require("util");
  var pAccess = promisify(fs.access);
  module2.exports = async (path) => {
    try {
      await pAccess(path);
      return true;
    } catch (_) {
      return false;
    }
  };
  module2.exports.sync = (path) => {
    try {
      fs.accessSync(path);
      return true;
    } catch (_) {
      return false;
    }
  };
});

// node_modules/find-up/index.js
var require_find_up = __commonJS((exports2, module2) => {
  "use strict";
  var path = require("path");
  var locatePath = require_locate_path();
  var pathExists = require_path_exists();
  var stop = Symbol("findUp.stop");
  module2.exports = async (name, options = {}) => {
    let directory = path.resolve(options.cwd || "");
    const {root} = path.parse(directory);
    const paths = [].concat(name);
    const runMatcher = async (locateOptions) => {
      if (typeof name !== "function") {
        return locatePath(paths, locateOptions);
      }
      const foundPath = await name(locateOptions.cwd);
      if (typeof foundPath === "string") {
        return locatePath([foundPath], locateOptions);
      }
      return foundPath;
    };
    while (true) {
      const foundPath = await runMatcher({...options, cwd: directory});
      if (foundPath === stop) {
        return;
      }
      if (foundPath) {
        return path.resolve(directory, foundPath);
      }
      if (directory === root) {
        return;
      }
      directory = path.dirname(directory);
    }
  };
  module2.exports.sync = (name, options = {}) => {
    let directory = path.resolve(options.cwd || "");
    const {root} = path.parse(directory);
    const paths = [].concat(name);
    const runMatcher = (locateOptions) => {
      if (typeof name !== "function") {
        return locatePath.sync(paths, locateOptions);
      }
      const foundPath = name(locateOptions.cwd);
      if (typeof foundPath === "string") {
        return locatePath.sync([foundPath], locateOptions);
      }
      return foundPath;
    };
    while (true) {
      const foundPath = runMatcher({...options, cwd: directory});
      if (foundPath === stop) {
        return;
      }
      if (foundPath) {
        return path.resolve(directory, foundPath);
      }
      if (directory === root) {
        return;
      }
      directory = path.dirname(directory);
    }
  };
  module2.exports.exists = pathExists;
  module2.exports.sync.exists = pathExists.sync;
  module2.exports.stop = stop;
});

// src/index.ts
var import_axios = __toModule(require("axios"));

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
var relayResponseFromAppToClient = (fastifyReply, appResponse, reflectHeaders = true) => {
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
};
var setCorsHeaders = (reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  reply.header("Access-Control-Allow-Headers", "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range");
  reply.header("Access-Control-Expose-Headers", "Content-Length,Content-Range");
};
var sendPreflightCorsResponse = (fastifyReply) => {
  const sentReply = fastifyReply.code(204);
  setCorsHeaders(sentReply);
  sentReply.header("Access-Control-Max-Age", 3600 * 24);
  sentReply.header("Content-Type", "text/plain; charset=utf-8");
  sentReply.send("");
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
  onGet(config2, axios2) {
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
  onOptions(config2, axios2) {
    return async (req, reply) => {
      sendPreflightCorsResponse(reply);
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
Application.VERSION = "0.2.5";
Application.NAME = "ray-proxy";

// src/classes/ProxyConfig.ts
var import_fs = __toModule(require("fs"));
var findUp = require_find_up();
var defaultProxyConfigurationData = {
  hostName: "localhost",
  hostPort: 23516,
  proxyPort: 23517,
  displayBanner: true
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
      filename = findUp.sync("ray-proxy.config.js");
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

// src/index.ts
var fastify = require("fastify")({
  logger: true
});
var config = ProxyConfig.loadFromFile();
var app = new Application(fastify, config, import_axios.default);
app.start();
