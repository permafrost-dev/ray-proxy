import axios from 'axios';
import { Application } from './Application';
import { ProxyConfig } from './classes/ProxyConfig';

const fastify = require('fastify')({
    logger: true,
});

const config = ProxyConfig.loadFromFile();
const app = new Application(fastify, config, axios);

app.start();
