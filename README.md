# ray-proxy

---

This project acts as a proxy in front of [Ray](https://myray.app) that sends CORS headers.  This allows use of the [js-ray](https://github.com/m1guelpf/ray-js) package during development of webpages.

Internally, this project uses the [fastify](https://www.fastify.io/) package for the http service and the [axios](https://github.com/axios/axios) package to forward the incoming requests to Ray.

The proxy will run on port `3000` and forward the requests from `js-ray` to `http://localhost:23517`.

_This is a work in progress and may change considerably without notice._

---

Instructions:

```bash
# install required packages
npm install

# run in development mode
npm run dev

# or run in production mode:
npm run prod
```

---

**project features:**

- esbuild
- eslint
- husky v4
- lint-staged
- prettier
- jest
- typescript

**npm scripts:**

- run tests
- format all
- lint all
- lint and fix all
- build (dev/prod)
- build & run (dev/prod)

**git hooks:**

- pre-commit:
  - *.ts,*.js - format and lint

---

## Testing

This package uses jest for unit tests.  To run the test suite, run:

`npm run test`

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

---

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
