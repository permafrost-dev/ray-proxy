<p align="center">
    <img src="https://static.permafrost.dev/images/ray-proxy/ray-proxy-logo-256x256.png" alt="ray-proxy" height="200" style="block">
    <br><br>
    <code style="font-size:3.0rem;"><strong>ray-proxy</strong></code>
    <br><br>
</p>

# ray-proxy

---

This project acts as a proxy in front of [Ray](https://myray.app) for debugging the data sent between your app and the Ray app.

Internally, this project uses the [fastify](https://www.fastify.io/) package for the http service and the [axios](https://github.com/axios/axios) package to forward the incoming requests to Ray.

The proxy will run on port `23517` and forward the requests to `http://localhost:23516`.

_This is a work in progress and may change considerably without notice._

---

## Instructions

```bash
# install required packages
npm install

# run in development mode
npm run dev

# or run in production mode:
npm run prod
```

Or you can build and run manually:

```bash
npm run build:prod # or build:dev

node run dist/ray-proxy.js
```

---

## Testing

This package uses jest for unit tests. To run the test suite, run:

`npm run test`

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

---

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
