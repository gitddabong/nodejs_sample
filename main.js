var topic = require('./lib/topic');
var author = require('./lib/author');
var bodyParser = require('body-parser');

const express = require('express');
const app = express();
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// json 형식의 요청일 경우 이렇게 처리하면 된다~
app.use(bodyParser.json());

// route, routing
// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

app.get('/', function (request, response) {
    topic.home(request, response);
});

app.get('/page/:pageId', function (request, response) {
    topic.page(request, response);
});

app.get('/create', function(request, response) {
    topic.create(request, response);
});

app.post('/create_process', function(request, response) {
    topic.create_process(request, response);
});

app.get('/update/:pageId', function(request, response) {
    topic.update(request, response);
});

app.post('/update_process', function(request, response) {
    topic.update_process(request, response);
});

app.post('/delete_process', function(request, response) {
    topic.delete_process(request, response);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

/*
var http = require('http');
var url = require('url');   // url이라는 모듈을 사용할 것이다
var topic = require('./lib/topic');
var author = require('./lib/author');

var app = http.createServer(function(request,response){ // request : 요청받은 정보, response : 응답할 정보
    var _url = request.url;
    var queryData = url.parse(_url, true).query;    // url에서 id로 넘겨준 값을 파싱해서 받아옴.
    var pathname = url.parse(_url, true).pathname;  // 루트 경로로 접근했는지 조사하기 위한 변수

    if (pathname === '/') {
        if (queryData.id === undefined) {

        } else {        // id값을 무언가 받은 경우
            
        }
    } else if (pathname === '/create') {
        
    } else if (pathname === '/create_process') {
        
    } else if (pathname === '/update') {
        topic.update(request, response)
    } else if (pathname === '/update_process') {
        topic.update_process(request,response);
    } else if (pathname === '/delete_process') {
        topic.delete_process(request, response);
    } else if (pathname === '/author') {
        author.home(request, response);
    } else if (pathname === '/author/create_process') {
        author.create_process(request, response);
    } else if (pathname === '/author/update') {
        author.update(request, response);
    } else if (pathname === '/author/update_process') {
        author.update_process(request, response);
    } else if (pathname === '/author/delete_process') {
        author.delete_process(request, response);
    } else {
        response.writeHead(404);    // 404 : 파일을 찾을 수 없다
        response.end('Not Found');
    }
});
app.listen(3000);
*/