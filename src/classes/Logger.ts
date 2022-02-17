import { Counters } from '@/classes/Counters';
import { RequestCache } from '@/classes/RequestCache';
import { formatPayloadSize } from '@/lib/utils';

export class Logger {
    public counters: Counters;
    public requestCache: RequestCache;
    public logger: any;

    constructor(counters: Counters, requestCache: RequestCache, logger: any = null) {
        this.logger = logger ?? console;
        this.counters = counters;
        this.requestCache = requestCache;
    }

    public log(...args: any[]) {
        this.logger.log(...args);
    }

    public separator() {
        this.log('---');
    }

    public logRayAppStats(requestTime: number) {
        const avgTime = (this.counters.totalResponseTimeMs / this.counters.totalRequestCounter).toFixed(1);

        this.log(`[Ray App] response time from Ray (last): ${requestTime} ms`);
        this.log(`[Ray App] response time from Ray (avg): ${avgTime} ms`);
    }

    public logProjectStats() {
        this.log(`[project] requests/sec to Ray app: ${this.requestCache.requestsPerSec().toFixed(2)}`);
        this.log(`[payload] data sent (total): ${formatPayloadSize(this.counters.totalBytesSent)} kb`);
    }

    public logPayloadStats(payload: string) {
        const avgRequestBytes = this.counters.totalBytesSent / this.counters.totalRequestCounter;

        this.log(`[payload] data sent (last payload): ${formatPayloadSize(payload.length)} kb`);
        this.log(`[payload] data sent (avg/request): ${formatPayloadSize(avgRequestBytes)} kb`);
    }

    public logPayload(payload: string) {
        this.log('payload: ', payload);
    }

    public display(requestTime: number, payload: string) {
        this.separator();
        this.logPayload(payload);
        this.separator();
        this.logRayAppStats(requestTime);
        this.logProjectStats();
        this.logPayloadStats(payload);
        this.separator();
    }
}
