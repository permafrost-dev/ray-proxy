/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Counters } from '@/classes/Counters';
import { EventHandlers } from '@/classes/EventHandlers';
import { Logger } from '@/classes/Logger';
import { ProxyConfig } from '@/classes/ProxyConfig';
import { RequestCache } from '@/classes/RequestCache';

export class Application {
    public static VERSION = '__BUILD_VERSION__';
    public static NAME = '__APP_NAME__';
    public axios: any;
    public fastify: any;
    public config: ProxyConfig;
    public requestCache: RequestCache;
    public counters: Counters;
    public logger: Logger;
    public initialized = false;

    constructor(fastify: any, config: ProxyConfig, axios: any, requestCache?: RequestCache, counters?: Counters, logger?: Logger) {
        this.axios = axios;
        this.fastify = fastify;
        this.config = config;
        this.requestCache = requestCache || new RequestCache();
        this.counters = counters || new Counters();
        this.logger = logger || new Logger(this.counters, this.requestCache);
        this.initialized = false;

        this.initEventHandlers();
        this.displayBanner();
    }

    public displayBanner() {
        if (this.config.displayBanner) {
            this.logger.log(
                `
    ,---.,---.,   .   ,---.,---.,---..  ,,   .
    |    ,---||   |---|   ||    |   | >< |   |
    \`    \`---^\`---|   |---'\`    \`---''  \`\`---|
              \`---'   |                  \`---'
`,
            );
        }

        this.logger.log(`Running ${Application.NAME} v${Application.VERSION}`);
        this.logger.log(`Proxy listening on local port ${this.config.proxyPort}`);
        this.logger.log(`Proxy forwarding to Ray host ${this.config.hostName}`);
        this.logger.log(`Proxy forwarding to Ray port ${this.config.hostPort}`);
    }

    public initEventHandlers(axios: any = null, handlers: EventHandlers | null = null) {
        axios = axios ?? this.axios;
        handlers = handlers ?? new EventHandlers();

        if (!this.initialized) {
            this.fastify.post('/', handlers.onPost(this.config, axios, this.requestCache, this.counters, this.logger));
            this.fastify.get('/locks/*', handlers.onGet(this.config, axios));
            this.fastify.get('/*', handlers.onGet(this.config, axios));
            this.fastify.head('/', handlers.onHead(this.config, axios));
            this.fastify.options('/', handlers.onOptions(this.config, axios));

            this.initialized = true;
        }
    }

    public exit(errCode = 0) {
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
}
