"use strict";

const http  = require('http');
const path   = require('path');
const expect = require('expect.js');

const fetch  = require('nyks/http/fetch');
const drain  = require('nyks/stream/drain');
const md5    = require('nyks/crypto/md5');

const mountTar = require('../');

describe("Minimal test suite", function() {

  var port, server, mount;
  let mock_file = path.resolve(__dirname, "html_moving_rect.tar");

  it("Should start a dummy server", function(done) {

    mount = mountTar(mock_file, {index : "test.html"});
    server = http.createServer(mount);

    server.listen(0, function() {
      port = this.address().port;
      done();
    });

  });

  it("should expose a simple file", async () => {

    let [res, res2] = await Promise.all([fetch(`http://127.0.0.1:${port}/`), fetch(`http://127.0.0.1:${port}/test2.png/drawing2.png`)]);

    expect(res.statusCode).to.eql(200);
    expect(res.headers['content-type']).to.eql("text/html");
    let challenge = md5(await drain(res));
    expect(challenge).to.eql("99592ddbda8174399c5c3e1a52f1d186");

    expect(res2.statusCode).to.eql(200);
    expect(res2.headers['content-type']).to.eql("image/png");
    let challenge2 = md5(await drain(res2));
    expect(challenge2).to.eql("dedba378177d27ad9199a9cba099a2d4");
  });

  it("should test retrieve", async () => {
    let challenge = md5(await mount.retrieve("test.html"));
    expect(challenge).to.eql("99592ddbda8174399c5c3e1a52f1d186");

    challenge = md5(await mount.retrieve());
    expect(challenge).to.eql("99592ddbda8174399c5c3e1a52f1d186");
  });

  it("should reject missing file", async () => {
    let remote_url = `http://127.0.0.1:${port}/nope.html`;
    let res = await fetch(remote_url);

    expect(res.statusCode).to.eql(404);
  });


  it("should free up resources", function() {
    mount.close(); //not fuu
  });



});
