'use strict';

const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const WS = require('ws');
const app = new Koa();

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

let listOfMessages = [];

app.use(async (ctx, next) => {
  const { method } = ctx.request.query;
  ctx.response.set({ 'Access-Control-Allow-Origin': '*', });
  if ( ctx.request.method === 'POST' || ctx.response.body.method === 'getAllMessages' ) {
    ctx.response.status = 290;
    ctx.response.body = listOfMessages;
  }
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback())
const wsServer = new WS.Server({ server });

wsServer.on('connection', (ws, req) => {
  const errCallback = ( err ) => { if (err) { console.log( err ) } };

  ws.on('message', msg => {
    if (msg) { listOfMessages.push( JSON.parse(msg) ) }
    ws.send('response', errCallback);
    Array.from(wsServer.clients)
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send('toUpdate'));
  });

  ws.send('welcome', errCallback);
});

server.listen( port );
