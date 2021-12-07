[![Build Status](https://github.com/131/tar-serve-http/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/131/tar-serve-http/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/131/tar-serve-http/badge.svg?branch=master)](https://coveralls.io/github/131/tar-serve-http?branch=master)
[![Version](https://img.shields.io/npm/v/tar-serve-http.svg)](https://www.npmjs.com/package/tar-serve-http)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![Code style](https://img.shields.io/badge/code%2fstyle-ivs-green.svg)](https://www.npmjs.com/package/eslint-plugin-ivs)


# Motivation
[tar-serve-http](https://github.com/131/tar-serve-http) exposes a tar archive contents as an http middleware.

# API/usage

```
const http     = require('http');
const mountTar = require('tar-serve-http');

var server = http.createServer(mountTar("/some/file.tar"));

server.listen(0, function() {
  let port = this.address().port;
  console.log("tar contents is now accessible on http://localhost:%d/", port);
  server.close(); //close server and release tar
});

```


# Credits / thanks
* [131, author](https://github.com/131)
* [mafintosh tar-stream](https://github.com/mafintosh/tar-stream)


