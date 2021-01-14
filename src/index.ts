import axios from 'axios';

const fastify = require('fastify')({
    logger: true,
});

fastify.post('/', async (request, reply) => {
    await axios.post('http://localhost:23517', request.body);

    reply
        .code(200)
        .header('Content-Type', 'text/plain; charset=utf-8')
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Expose-Headers', '*')
        .send('ok');
});

fastify.options('/', async (req, reply) => {
    reply
        .code(200)
        .header('Content-Type', 'text/plain; charset=utf-8')
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Headers', '*')
        .header('Access-Control-Expose-Headers', '*')
        .header('Allow', 'GET,HEAD,POST,PUT')
        .header('Vary', 'Access-Control-Request-Method')
        .header('Cache-Control', 'no-cache, private')
        .send();
});

const start = async () => {
    try {
        await fastify.listen(3000);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
