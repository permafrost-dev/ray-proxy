export class Counters {
    public totalBytesSent = 0;
    public totalRequestCounter = 0;
    public totalResponseTimeMs = 0;

    public constructor() {
        this.reset();
    }

    public reset(): this {
        this.totalBytesSent = 0;
        this.totalRequestCounter = 0;
        this.totalResponseTimeMs = 0;

        return this;
    }

    public onPayloadSent(payload: string): this {
        this.totalBytesSent += payload.length;

        return this;
    }

    public onRequestTime(requestTime: number): this {
        this.totalResponseTimeMs += requestTime;

        return this;
    }

    public onRequestSent(): this {
        this.totalRequestCounter += 1;

        return this;
    }
}
