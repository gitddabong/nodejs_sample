const express = require('express')
var app = express()

var db = require('./db');
var template = require('./template.js');
var url = require('url');   // url이라는 모듈을 사용할 것이다
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

exports.home = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list, 
            `<h2>${title}</h2><p>${description}</p>`,
            `<a href="/create">create</a>`
        );
        response.writeHead(200);    // 200 : 파일을 성공적으로 전송했다
        response.end(html);
    });
}

exports.page = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;    // url에서 id로 넘겨준 값을 파싱해서 받아옴.
    db.query(`SELECT * FROM topic`, function(error, topics){
        if(error){
            throw error;
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic){
            if (error2){
                throw error2;
            }
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.HTML(title, list, 
                `
                <h2>${sanitizeHtml(title)}</h2>
                <p>${sanitizeHtml(description)}</p>
                <p>by ${sanitizeHtml(topic[0].name)}</p>
                `,
                `   <a href="/create">create</a> 
                    <a href="/update?id=${queryData.id}">update</a>
                    <form action="delete_process" method="post">
                        <input type="hidden" name="id" value="${queryData.id}">
                        <input type="submit" value="delete">
                    </form>
                `
            );
            response.writeHead(200);    // 200 : 파일을 성공적으로 전송했다
            response.end(html);
        });
    });

}

exports.create = function(request, response){
    db.query(`SELECT * FROM topic`, function(error, topics){
        db.query(`SELECT * FROM author`, function(error2, authors){
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(sanitizeHtml(title), list, 
                `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `, '');
            response.writeHead(200);    // 200 : 파일을 성공적으로 전송했다
            response.end(html);
        });
    });
}

exports.create_process = function(request, response){
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
            INSERT INTO topic (title, description, created, author_id) 
                VALUES(?, ?, NOW(), ?);`,
            [post.title, post.description, post.author],
            function(error, result){
                if (error){
                    throw error;
                }
                response.writeHead(302, {Location: `/?id=${result.insertId}`});   // 302는 다른 페이지로 보내겠다는 뜻
                response.end();
            }
        )
    });
}

exports.update = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;    // url에서 id로 넘겨준 값을 파싱해서 받아옴.

    db.query(`SELECT * FROM topic`, function(error, topics){        // 이 쿼리문은 리스트 띄우는 용도
        if(error){
            throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic){
            if (error2){
                throw error2;
            }
            db.query(`SELECT * FROM author`, function(error3, authors){
                if (error3){
                    throw error3;
                }
                var list = template.list(topics);
                var html = template.HTML(sanitizeHtml(topic[0].title), list, 
                `
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${topic[0].id}">
                    <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors, topic[0].author_id)}
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
            );
            response.writeHead(200);    // 200 : 파일을 성공적으로 전송했다
            response.end(html);
            });
        });
    });
}

exports.update_process = function(request, response){
    var body = '';
    request.on('data', function(data) {  // request로 들어오는 데이터의 양이 너무 많을 것을 대비해서 매번 데이터를 받아오는 형식
        body += data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        var author = post.author;
        db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`,
            [title, description, author, id],
            function(error, result){
                if (error){
                    throw error;
                }
                response.writeHead(302, {Location: `/?id=${post.id}`});   // 302는 다른 페이지로 보내겠다는 뜻
                response.end('success');
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
        var id = post.id;
        db.query('DELETE FROM topic WHERE id=?', [id], function(error, result){
            if (error){
                throw error;
            }
            response.writeHead(302, {Location: `/`});   // 302는 다른 페이지로 보내겠다는 뜻
            response.end();
        });

        // fs.unlink(`data/${filteredId}`, function(error){
        //     response.writeHead(302, {Location: `/`});   // 302는 다른 페이지로 보내겠다는 뜻
        //     response.end(); 
        // });
    });
}