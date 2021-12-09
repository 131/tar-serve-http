"use strict";

const url   = require('url');
const fs    = require('fs');
const path  = require('path');

const mime  = require('mime');
const tar   = require('tar-stream');
const drain = require('nyks/stream/drain');
const ltrim = require('mout/string/ltrim');

const mountTar = function(tar_path, {index = "index.html"}) {

  let contents = null;

  let extract = async function() {
    let contents = {};
    let packed = fs.createReadStream(tar_path);
    var unpack = tar.extract();

    unpack.on('entry', async function(header, stream, next) {
      contents[path.posix.normalize(header.name)] = await drain(stream);
      next();
    });

    packed.pipe(unpack);

    await new Promise(done => unpack.on('finish', done));

    return contents;
  };

  let process = async function(req, res) {
    contents = await (contents || extract());

    let {pathname} = url.parse(ltrim(req.url, '/'));
    if(!pathname)
      pathname = index;

    let body = contents[pathname];
    if(!body)
      return res.statusCode = 404, res.end();

    res.setHeader('Content-Type', mime.getType(pathname));
    res.end(body);
  };

  process.close = function() {
    contents = null;
  };

  process.retrieve = async function(file_name = index) {
    contents = await (contents || extract());
    return contents[file_name];
  };

  return process;
};

module.exports = mountTar;
