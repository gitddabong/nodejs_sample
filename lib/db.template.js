// 버전 관리를 위해 내용이 없는 템플릿 파일을 만들고
// 실제 서비스에 사용할 때 이 파일을 복사해서 내용을 기입하여 사용한다.
// git에 올린다면, gitignore에서 이 파일을 제외하는 방법을 사용할 듯.

var mysql = require('mysql');
var db = mysql.createConnection({
    host:'',
    user:'',
    password:'',
    database:''
});
db.connect();
module.exports = db;