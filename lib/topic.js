var db = require('./db');
var template = require('./template.js');
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
        response.send(html);
    });
}

exports.page = function(request, response){
    id = request.params.pageId;

    db.query(`SELECT * FROM topic`, function(error, topics){
        if(error){
            throw error;
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [id], function(error2, topic){
            if (error2) {
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
                    <a href="/update/${id}">update</a>
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${id}">
                        <input type="submit" value="delete">
                    </form>
                `
            );
            response.send(html);
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
            response.send(html);
        });
    });
}

exports.create_process = function(request, response){
    var post = request.body;
    db.query(`
        INSERT INTO topic (title, description, created, author_id) 
            VALUES(?, ?, NOW(), ?);`,
        [post.title, post.description, post.author],
        function(error, result){
            if (error) {
                throw error;
            }
            response.redirect(`/page/${result.insertId}`);
        }
    );
}

exports.update = function(request, response){
    id = request.params.pageId;

    db.query(`SELECT * FROM topic`, function(error, topics){        // 이 쿼리문은 리스트 띄우는 용도
        if(error){
            throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [id], function(error2, topic){
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
                `<a href="/create">create</a> <a href="/update/${topic[0].id}">update</a>`
            );
            response.send(html);
            });
        });
    });
}

exports.update_process = function(request, response){
    var post = request.body;
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
            response.redirect(`/page/${post.id}`);
        }
    )
}

exports.delete_process = function(request, response){
    var post = request.body;
    var id = post.id;
    db.query('DELETE FROM topic WHERE id=?', [id], function(error, result){
        if (error){
            throw error;
        }
        response.redirect(`/`);
    });
}