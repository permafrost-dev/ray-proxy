import { existsSync } from 'fs';
import { findUpSync } from 'find-up';

export interface ProxyConfigurationData {
    hostName?: string;
    hostPort?: number;
    proxyPort?: number;
    displayBanner?: boolean;
}

export const defaultProxyConfigurationData = {
    hostName: 'localhost',
    hostPort: 23516,
    proxyPort: 23517,
    displayBanner: true,
};

export class ProxyConfig {
    public data: ProxyConfigurationData = defaultProxyConfigurationData;

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

    constructor(config: ProxyConfigurationData = {}) {
        this.useConfiguration(config);
    }

    public useConfiguration(config: ProxyConfigurationData): void {
        this.data = Object.assign({}, defaultProxyConfigurationData, config);
    }

    public static loadFromFile(filename: string | null = null): ProxyConfig {
        if (!filename) {
            filename = findUpSync('ray-proxy.config.js') || null;

            if (filename === undefined) {
                filename = __dirname + '/ray-proxy.config.js';
            }
        }

        if (filename === null || !existsSync(filename)) {
            //throw new Error('config file not found.');
            console.log('config file not found, using defaults');

            return new ProxyConfig(defaultProxyConfigurationData);
        }

        let configData: ProxyConfigurationData;

        try {
            configData = require(filename); //<ProxyConfigurationData>JSON.parse(contents);
            return new ProxyConfig(configData);
        } catch (err) {
            console.log('Could not load config file:', err);

            throw err;
        }
    }
}
