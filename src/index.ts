import { Application } from '@/Application';
import { ProxyConfig } from '@/classes/ProxyConfig';
import axios from 'axios';
import Fastify from 'fastify';

async function main() {
    const fastify = Fastify({
        logger: true,
    });

    const config = ProxyConfig.loadFromFile();
    const app = new Application(fastify, config, axios);

    return app.start();
}

main();
