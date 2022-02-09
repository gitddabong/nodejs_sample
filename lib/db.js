var mysql = require('mysql');
var db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'111111',
    database:'opentutorials',
    multipleStatements:false     // 여러 개의 SQL문을 사용하는 것을 허용
});
db.connect();
module.exports = db;