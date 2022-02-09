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
            topic.home(request, response);
        } else {        // id값을 무언가 받은 경우
            topic.page(request, response);
        }
    } else if (pathname === '/create') {
        topic.create(request, response);
    } else if (pathname === '/create_process') {
        topic.create_process(request, response);
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
