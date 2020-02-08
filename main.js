const express = require('express');
const app = express(); // 상수 express는 함수이며, 어플리케이션 객체를 반환한다
const port =3000;
const fs = require('fs');
const helmet = require('helmet');

// body-parser module은 요청이 들어올 때마다 req에 body 프로퍼티를 추가함
var bodyParser = require('body-parser');
var compression = require('compression');
var topicRouter = require('./routes/topic.js');
var indexRouter = require('./routes/index.js');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
// compression()은 compression 미들웨어를 반환함
app.use(compression()); // app.use를 통해 compression을 장착하는 형태
app.use(helmet());

// get 방식으로 들어오는 모든 요청에 대해서만 파일 목록을 가져오기
app.get('*', function(req, res, next){
  fs.readdir('./data', function(err, filelist){
    req.list = filelist;
    next();
  });
});

// /topic으로 시작하는 모든 라우터에 topicRouter 미들웨어 적용함
app.use('/topic', topicRouter);
// 홈화면에 대한 라우터에 indexRouter 미들웨어 적용
app.use('/', indexRouter);

// 미들웨어는 순차적으로 실행되기 때문에
// 404 에러를 다루는 미들웨어는 최하단에 위치시켜야 함
app.use(function(req, res, next){
  res.status(404).send('Sorry cant find the page!');
});

// err: next를 통해 전달받을 에러메세지
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, function(){
  console.log(`Example app listening on port${port}!`);
});
// app.listen(port, () => console.log(`Example app listening on port${port}!`));