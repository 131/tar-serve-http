"use strict";

const url = require('url');
const fs    = require('fs');

const mime  = require('mime');
const tar   = require('tar-stream');
const drain = require('nyks/stream/drain');
const ltrim = require('mout/string/ltrim');

const mountTar = function(tar_path) {

  let contents = null;

  let extract = async function() {
    let contents = {};
    let packed = fs.createReadStream(tar_path);
    var unpack = tar.extract();

    unpack.on('entry', async function(header, stream, next) {
      contents[header.name] = await drain(stream);
      next();
    });

    packed.pipe(unpack);

    await new Promise(done => unpack.on('finish', done));

    return contents;
  };

  let process = async function(req, res) {
    contents = await (contents || extract());

    let {pathname} = url.parse(ltrim(req.url, '/'));

    let body = contents[pathname];
    if(!body)
      return res.statusCode = 404, res.end();

    res.setHeader('Content-Type', mime.getType(pathname));
    res.end(body);
  };

  process.close = function() {
    contents = null;
  };

  return process;
};

module.exports = mountTar;
