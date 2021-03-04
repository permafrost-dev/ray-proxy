export class RequestCache {
    public countCache: number[] = [];
    public times: Record<number, number> = {};

    /**
     * add an entry to the request history.
     *   you should call cache() once on each request
     *
     * @param currentTs number|null
     */
    public cache(requestId: any, currentTs: number | null = null, purgeOldItems = true): void {
        this.times[requestId] = currentTs ?? new Date().getTime();

        currentTs = Number(((currentTs ?? new Date().getTime()) / 1000).toFixed(0));

        this.countCache.push(currentTs);

        if (this.countCache.length > 3000) {
            this.countCache.splice(0, this.countCache.length - 3000);
        }

        if (purgeOldItems) {
            this.purgeCache(currentTs);
        }
    }

    /**
     * returns the number of requests per second based on the current request cache history.
     *
     * @returns number|float
     */
    public requestsPerSec(): number {
        if (!this.countCache.length) {
            return 0.0;
        }

        const firstTs = this.countCache[0];
        const lastTs = this.countCache[this.countCache.length - 1];
        let elapsedTime = lastTs - firstTs;

        if (elapsedTime <= 0) {
            elapsedTime = 1;
        }

        // console.log({ firstTs, lastTs, length: this.countCache.length, elapsedTime });

        return this.countCache.length / elapsedTime;
    }

    /**
     *
     * @param currentTs number
     * @param maxAgeInSeconds number
     */
    public purgeCache(currentTs: number, maxAgeInSeconds = 5): void {
        // purge entries older than maxAgeInSeconds sec
        this.countCache = this.countCache.filter(ts => currentTs - ts <= maxAgeInSeconds);
    }
}
