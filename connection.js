const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'Walid',
  password: '2004Walid.',
  database: 'webshop'
});

db.connect(function(err){
  if(err) {
      console.log(err);
  } else {
      console.log('connected to mySQL');
  }
});


module.exports = db;