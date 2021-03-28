const Koa = require('koa');
const Router = require('koa-router');

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');    //将函数promise化

const stat = promisify(fs.stat);    //用来获取文件的信息
const mime = require('mime');   //mime类型获取插件

let app = new Koa();
let router = new Router();
let date = new Date();


const http = require('http').createServer(app.callback());

function static(dir) {
  return async (ctx, next) => {
    let pathname = ctx.path;
    let realPath = path.join(dir, pathname);
    
    console.log("real path " + realPath);
    try {
      let statObj = await stat(realPath);
      if (statObj.isFile()) {
        console.log("Send File !");
        ctx.set('Content-Type', mime.getType(realPath) + ";charset=utf-8");
        ctx.body = fs.createReadStream(realPath)
      } else {
        //如果不是文件，则判断是否存在index.html
        let filename = path.join(realPath, 'index.html')
        console.log("Send index" + filename);
        await stat(filename)
        ctx.set('Content-Type', "text/html;charset=utf-8");
        ctx.body = fs.createReadStream(filename);
      }
    } catch (e) {
      await next();   //交给后面的中间件处理
    }
  }
}

app.use(static(__dirname));
app.use(router.routes());


const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
io.on('connection', (socket) => {
  console.info(date.toLocaleString(), `Client connected [id=${socket.id}]`);
  socket.on('disconnect', async function () {
    console.info(date.toLocaleString(), `Client [id=${socket.id}] disconnect :)`);
  });
  
  socket.on('bts:sendGeometry', async function (data) {
    console.log(date.toLocaleString(), 'bts:sendGeometry: ' + data);
    data.id = socket.id;
  
    console.log('bts:' + data.app + 'ReceiveGeometry')
    io.emit('bts:' + data.app + 'ReceiveGeometry', data);
  
  });
  
  socket.on('stb:sendGeometry', async function (data) {
    data = JSON.parse(data);
    console.log(date.toLocaleString(), 'stb:sendGeometry');
    io.to(data.id).emit('stb:receiveGeometry', data.geometryElements);
  });
  
});

http.listen(27781, () => {
  console.log("listening on *:27781")
});
