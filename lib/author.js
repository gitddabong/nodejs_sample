var db = require('./db');
var template = require('./template.js');
var qs = require('querystring');
var url = require('url');
var sanitizeHtml = require('sanitize-html');

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){            
            var title = 'author';
            var list = template.list(topics);
            var html = template.HTML(title, list, 
                `
                ${template.authorTable(authors)}
                <style>
                    table{
                        border-collapse: collapse;
                    }
                    td{
                        border:1px solid black;
                    }
                </style>

                
                <form action="author/create_process" method="post">
                    <p>
                        <input type="text" name="name" placeholder="name">
                    </p>
                    <p>
                        <textarea name="profile" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit" value="create">
                    </p>
                </form>
                `,
                ``
            );
            response.writeHead(200);    // 200 : 파일을 성공적으로 전송했다
            response.end(html);
        });
    });
}

exports.create_process = function(request, response) {
    var body = '';
    request.on('data', function(data) {  // request로 들어오는 데이터의 양이 너무 많을 것을 대비해서 매번 데이터를 받아오는 형식
        body += data;
        
        // 너무 큰 용량의 데이터가 들어올 경우 서버를 종료하는 코드
        // if (body.length > 1e6)
        //     request.connection.destroy();
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`
            INSERT INTO author (name, profile) 
                VALUES(?, ?);`,
            [post.name, post.profile],
            function(error, result){
                if (error){
                    throw error;
                }
                response.writeHead(302, {Location: `/author`});   // 302는 다른 페이지로 보내겠다는 뜻
                response.end();
            }
        )
    });
}

exports.update = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){ 
            var _url = request.url;
            var queryData = url.parse(_url, true).query;    // url에서 id로 넘겨준 값을 파싱해서 받아옴.      

            db.query(`SELECT * FROM author WHERE id=?`,[queryData.id] , function(error3, author){
                var title = 'author';
                var list = template.list(topics);
                var html = template.HTML(sanitizeHtml(title), list, 
                    `
                    ${template.authorTable(authors)}
                    <style>
                        table{
                            border-collapse: collapse;
                        }
                        td{
                            border:1px solid black;
                        }
                    </style>
                    <form action="/author/update_process" method="post">
                        <p>
                            <input type="hidden" name="id" value="${queryData.id}">
                        </p>
                        <p>
                            <input type="text" name="name" value="${sanitizeHtml(author[0].name)}" placeholder="name">
                        </p>
                        <p>
                            <textarea name="profile" placeholder="description">${sanitizeHtml(author[0].profile)}</textarea>
                        </p>
                        <p>
                            <input type="submit" value="update">
                        </p>
                    </form>
                    `,
                    ``
                );
                response.writeHead(200);    // 200 : 파일을 성공적으로 전송했다
                response.end(html);
            });     
        });
    });
}

exports.update_process = function(request, response) {
    var body = '';
    request.on('data', function(data) {  // request로 들어오는 데이터의 양이 너무 많을 것을 대비해서 매번 데이터를 받아오는 형식
        body += data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`
            UPDATE author SET name=?, profile=?
                WHERE id=?`,
            [post.name, post.profile, post.id],
            function(error, result){
                if (error){
                    throw error;
                }
                response.writeHead(302, {Location: `/author`});   // 302는 다른 페이지로 보내겠다는 뜻
                response.end();
            }
        )
    });
}

exports.delete_process = function(request, response){
    var body = '';
    request.on('data', function(data) {  // request로 들어오는 데이터의 양이 너무 많을 것을 대비해서 매번 데이터를 받아오는 형식
        body += data;
    });
    request.on('end', function() {
        var post = qs.parse(body);

        db.query(`DELETE FROM topic WHERE author_id=?`, 
            [post.id], 
            function(error1, result1){
                if (error1) {
                    throw error1;
                }
                db.query('DELETE FROM author WHERE id=?',
                    [post.id], 
                    function(error2, result2){
                        if (error2){
                            throw error;
                        }
                        response.writeHead(302, {Location: `/author`});   // 302는 다른 페이지로 보내겠다는 뜻
                        response.end();
                    }
                );
            }
        );
    });
}