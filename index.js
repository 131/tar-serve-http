"use strict";

const url   = require('url');
const fs    = require('fs');
const path  = require('path');

const mime  = require('mime');
const tar   = require('tar-stream');
const drain = require('nyks/stream/drain');
const ltrim = require('mout/string/ltrim');

const mountTar = function(source_path, {index = "index.html"}) {
  let stats = fs.statSync(source_path);

  let contents = null;

  let extract = async function() {
    let contents = {};
    let packed = fs.createReadStream(source_path);
    var unpack = tar.extract();

    unpack.on('entry', async function(header, stream, next) {
      contents[path.posix.normalize(header.name)] = await drain(stream);
      next();
    });

    packed.pipe(unpack);

    await new Promise(done => unpack.on('finish', done));

    return contents;
  };


  let retrieve = async function(file_name = index) {
    if(stats.isDirectory()) {
      let file_path = path.join(source_path, file_name);
      if(!fs.existsSync(file_path))
        return false;
      return fs.readFileSync(file_path);
    } else {
      contents = await (contents || extract());
      return contents[file_name];
    }
  };

  let process = async function(req, res) {
    let {pathname} = url.parse(ltrim(req.url, '/'));
    if(!pathname)
      pathname = index;

    let body = await retrieve(pathname);
    if(!body)
      return res.statusCode = 404, res.end();

    res.setHeader('Content-Type', mime.getType(pathname));
    res.end(body);
  };

  process.retrieve = retrieve;
  process.close = function() {
    contents = null;
  };

  return process;
};



module.exports = mountTar;
