# Changelog

All notable changes to `permafrost-dev/ray-proxy` will be documented in this file.

---

## 0.4.0 - 2022-02-17

- update all dependency versions to latest
- minor code updates/tweaks
- use ESM everywhere

## 0.3.0 - 2021-03-11

- properly reflect Ray app response headers

- add handler for GET requests

- always send CORS headers
 
- respond to preflight requests

## 0.2.6 - unreleased

- bump `esbuild` version to `^0.9.0`

## 0.2.5 - 2021-03-09

- add search for config file on startup _(ray-proxy.config.js)_

## 0.2.4 - 2021-03-08

- fix binary script (again)

## 0.2.3 - 2021-03-08

- fix binary script

## 0.2.0 - 2021-03-08

- allow configuration via `ray-proxy.config.js` file

- return all headers from Ray app requests unchanged

- major code refactor

- create `ray-proxy` binary script as `node_modules/.bin/ray-proxy` upon package install

## 0.1.0 - 2021-01-14

- initial release, work in progress
