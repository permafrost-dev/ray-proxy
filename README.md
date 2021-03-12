<p align="center">
    <img src="https://static.permafrost.dev/images/ray-proxy/ray-proxy-logo-256x256.png" alt="ray-proxy" height="200" style="block">
    <br><br>
    <code style="font-size:3.0rem;"><strong>ray-proxy</strong></code>
    <br><br>
</p>

<p align="center">
    <img src="https://shields.io/npm/v/ray-proxy" alt="npm version"> <img src="https://img.shields.io/npm/dt/ray-proxy.svg" alt="npm downloads"> <img src="https://shields.io/github/license/permafrost-dev/ray-proxy" alt="license"> <img src="https://github.com/permafrost-dev/ray-proxy/workflows/Run%20Tests/badge.svg" alt="test status"> <img src="https://codecov.io/gh/permafrost-dev/ray-proxy/branch/main/graph/badge.svg?token=YW2BTKSNEO"/>
</p>

# ray-proxy

---

This project acts as a proxy in front of [Ray](https://myray.app) for debugging the data sent between your app and the Ray app.

Internally, this project uses the [fastify](https://www.fastify.io/) package for the http service and the [axios](https://github.com/axios/axios) package to forward the incoming requests to Ray.

By default, the proxy will run on port `23517` and forward the requests to `localhost` on port `23516`.

_This is a work in progress and may change considerably without notice._

---

![screenshot](https://static.permafrost.dev/images/ray-proxy/screenshot-01.png)

---

## Installation

```bash
npx ray-proxy
```

...or install it into a project:

```bash
npm install ray-proxy --save-dev

./node_modules/.bin/ray-proxy
```

## Precompiled Standalone Build

You can find a precompiled, standalone build on the [releases](../../releases) page under "Assets", named something like `ray-proxy-standalone-X.Y.Z.tgz` where `X.Y.Z` is the latest release version.

All you need to run the standalone build is a NodeJS v12+ installation.

## Configuration

Upon starting, `ray-proxy` looks for the file `ray-proxy.config.js` in the same directory as your current project's root directory.

This is optional and the application will use the default settings if no configuration file is found.

_Example:_

```js
// ray-proxy.config.js

module.exports = {
    hostName: 'localhost',
    hostPort: 23516,
    proxyPort: 23517,
    displayBanner: true,
}
```

---

## Development Instructions

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

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Patrick Organ](https://github.com/patinthehat)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
