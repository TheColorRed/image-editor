const sql = require('sqlite3')

let db = new sql.Database('./test.db')
db.get('SELECT soundex("cat");')