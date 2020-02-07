const express = require('express');
const app = express(); // 상수 express는 함수이며, 어플리케이션 객체를 반환한다
const port =3000;
const fs = require('fs');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var qs = require('querystring');
// body-parser module은 요청이 들어올 때마다 req에 body 프로퍼티를 추가함
var bodyParser = require('body-parser');
var compression = require('compression');

app.use(bodyParser.urlencoded({exteded: false}));
// compression()은 compression 미들웨어를 반환함
app.use(compression()); // app.use를 통해 compression을 장착하는 형태

// get 방식으로 들어오는 모든 요청에 대해서만 파일 목록을 가져오기
app.get('*', function(req, res){
  fs.readdir('./data', function(err, filelist){
    req.list = filelist;
    //next();
  });
});

// route of routing
// app.get('/', (req, res) => res.send('Hello World!'));
app.get('/', function(req, res){
  var title = 'Welcome';
  var description = 'Hello, Node.js';
  var list = template.list(req.list);
  var html = template.HTML(title, list,
    `<h2>${title}</h2>${description}`,
    `<a href="/create">create</a>`
  );
  res.send(html); // send() === writeHead() + end()
});

app.get('/page/:pageId', function(req, res){
  var filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    var title = req.params.pageId;
    var sanitizedTitle = sanitizeHtml(title);
    var sanitizedDescription = sanitizeHtml(description, {
      allowedTags:['h1']
    });
    var list = template.list(req.list);
    var html = template.HTML(sanitizedTitle, list,
      `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
      ` <a href="/create">create</a>
        <a href="/update/${sanitizedTitle}">update</a>
        <form action="/delete" method="post">
          <input type="hidden" name="id" value="${sanitizedTitle}">
          <input type="submit" value="delete">
        </form>`
    );
    res.send(html);
  });
  
});

app.post('/create', function(req, res){
  
  /*
  var body = '';
  req.on('data', function(data){
      body = body + data;
  });
  req.on('end', function(){
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        res.redirect(`/page/${title}`);
        // res.writeHead(302, {Location: `/page/${title}`});
        // res.end();
      });
  });
  */
  console.log(req.list); // undefiend
  var post = req.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function(err){
    res.redirect(`/page/${title}`);
    // res.writeHead(302, {Location: `/page/${title}`});
    // res.end();
  });

});

app.get('/create', function(req, res){
  var title = 'WEB - create';
  var list = template.list(req.list);
  var html = template.HTML(title, list, `
    <form action="/create" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
  `, '');
  res.send(html);
  
});

app.get('/update/:pageId', function(req, res){
  var filteredId = path.parse(req.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    var title = req.params.pageId;
    var list = template.list(req.list);
    var html = template.HTML(title, list,
      `
      <form action="/update/${title}" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `, '');
    res.send(html);
  });
});

app.post('/update/:pageId', function(req, res){
  var post = req.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(error){
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      res.redirect(`/page/${title}`);
    });
  }); 
});

app.post('/delete', function(req, res){
  var post = req.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function(error){
    res.redirect('/');
    // res.writeHead(302, {Location: `/`});
    // res.end();
  });
});

app.listen(port, function(){
  console.log(`Example app listening on port${port}!`);
});
// app.listen(port, () => console.log(`Example app listening on port${port}!`));

// var http = require('http');
// var fs = require('fs');
// var url = require('url');
// var qs = require('querystring');
// var template = require('./lib/template.js');
// var path = require('path');


// var app = http.createServer(function(request,response){
//     var _url = request.url;
//     var queryData = url.parse(_url, true).query;
//     var pathname = url.parse(_url, true).pathname;
//     if(pathname === '/'){
//       if(queryData.id === undefined){
//       } else {
//       }
//     } else if(pathname === '/create'){
//     } else if(pathname === '/create_process'){
//     } else if(pathname === '/update'){
//     } else if(pathname === '/update_process'){
//     } else if(pathname === '/delete_process'){
//     } else {
//       response.writeHead(404);
//       response.end('Not found');
//     }
// });
// app.listen(3000);