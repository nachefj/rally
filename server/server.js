var express    = require('express');
var bodyParser = require('body-parser')
var mysql      = require('mysql');

//Properties
var port                   = process.env.PORT || 3000;
var mysql_connection_limit = 100;
var mysql_host             = 'localhost';
var mysql_database         = 'rally';
var mysql_user             = 'root';
var mysql_password         = '';

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    next();
}

//Configure Express
var app    = express();
var router = express.Router();
app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use('/api', router);

//Configure MySQL
var connectionPool = mysql.createPool({
  connectionLimit : mysql_connection_limit,
  host            : mysql_host,
  database        : mysql_database,
  user            : mysql_user,
  password        : mysql_password
});

router.post('/login', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('SQL CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      connection.query('SELECT id, region_number, table_number FROM team WHERE table_number = ?', req.body.tableNumber, function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        } else {
          if (rows.length == 0) {
            connection.query('INSERT INTO team(region_number, table_number) VALUES(?, ?)', [req.body.regionNumber, req.body.tableNumber], function(err, result) {
              if (err) {
                console.error(err);
                res.statusCode = 500;
                res.send({result: 'error', err: err.code});
              } else {
                var team = new Object();
                team.id = result.insertId;
                team.regionNumber = req.body.regionNumber;
                team.tableNumber = req.body.tableNumber;

                res.send({result: 'success', err: '', json: team, length: 1});   
              }
            });
          } else {
            var team = new Object();
            team.id = rows[0].id;
            team.regionNumber = rows[0].region_number;
            team.tableNumber = rows[0].table_number;
            res.send({result: 'success', err: '', json: team, length: rows.length});  
          }
        }
        connection.release();
      });
    }
  });
});

function validateRequest(session, teamId) {
  if (session.id != teamId) {
    return false;
  }

  return true;
}

router.post('/score/:id', function(req, res) {
  if (!validateRequest(req.body.session, req.params.id)) {
    res.statusCode = 403;
    res.send({result: 'error', err: 'invalid request'});
    return;
  }

  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('SQL CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      connection.query('SELECT id, region_number, table_number FROM team WHERE id = ?', req.params.id, function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        } else {
          if (rows.length == 0) {
            res.statusCode = 403;
            res.send({result: 'error', err: 'invalid session'});
          } else {
            var team = new Object();
            team.id = rows[0].id;
            team.regionNumber = rows[0].region_number;
            team.tableNumber = rows[0].table_number;

            res.send({result: 'success', err: '', json: team, length: rows.length});
          }
        }
        connection.release();
      });
    }
  });
});

router.get('/budgets', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      connection.query('SELECT id, date, DATE_FORMAT(date, \'%m\') AS month, DATE_FORMAT(date, \'%Y\') AS year FROM budget', function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        }

        var budgets = new Array();
        for (var i=0; i<rows.length; i++) {
          var row = rows[i];
          var budget = new Object();
          budget.id = row.id;
          budget.date = row.date;
          budget.month = row.month;
          budget.year = row.year;
          budgets.push(budget);
        }

        res.send({result: 'success', err: '', json: budgets, length: rows.length});
        connection.release();
      });
    }
  })
});

router.post('/budgets', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      var budget = req.body;
      var paddedMonth = budget.month.id;
      if (paddedMonth < 10) {
        paddedMonth = '0'+paddedMonth;
      }
      var budgetDateString = budget.year.year + '-' + paddedMonth + '-01';

      connection.query('INSERT INTO budget(date) VALUES(?)', budgetDateString, function(err, result) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        }

        var budget = new Object();
        budget.id = result.insertId;
        budget.date = budgetDateString;

        res.send({result: 'success', err: '', json: budget, length: 1}); //TODO: return new ID
        connection.release();
      });
    }
  })
});

router.get('/nextbudgetdate', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      connection.query('SELECT MAX(date) as maxDate FROM budget', function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        }

        var maxDate = rows[0].maxDate;
        var nextBudget = new Object();

        if (!maxDate) {
          var today = new Date();
          nextBudget.month = today.getMonth()+1;
          nextBudget.year = today.getFullYear();
        } else {
          maxDate.setMonth(maxDate.getMonth() + 1);
          nextBudget.month = maxDate.getMonth()+1;
          nextBudget.year = maxDate.getFullYear();
        }

        res.send({result: 'success', err: '', json: nextBudget, length: rows.length});
        connection.release();
      });
    }
  })
});

router.get('/budget/:id', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      connection.query('SELECT id, date, DATE_FORMAT(date, \'%m\') AS month, DATE_FORMAT(date, \'%Y\') AS year FROM budget WHERE id = '+req.params.id, function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        }

        var budget = new Object();
        budget.id = rows[0].id;
        budget.date = rows[0].date;
        budget.month = rows[0].month;
        budget.year = rows[0].year;

        res.send({result: 'success', err: '', json: budget, length: rows.length});
        connection.release();
      });
    }
  })
});

router.get('/budget/:id/categories', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      var queryString = 'SELECT category.id, category.name, category.type ' +
                        'FROM category ' +
                          'JOIN budget_category ON budget_category.category_id = category.id ' +
                          'JOIN budget ON budget.id = budget_category.budget_id ' +
                        'WHERE budget.id = ' + req.params.id

      if (req.query.type) {
        queryString += ' AND type = \''+req.query.type+'\'';        
      }

      queryString += ' ORDER BY category.name';
      
      connection.query(queryString, function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        }

        var categories = new Array();
        for (var i=0; i<rows.length; i++) {
          var row = rows[i];
          var category = new Object();
          category.id = row.id;
          category.name = row.name;
          category.type = row.type;
          categories.push(category);
        }

        res.send({result: 'success', err: '', json: categories, length: rows.length});
        connection.release();
      });
    }
  })
});

router.get('/categories', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      var queryString = 'SELECT id, name, type FROM category WHERE 1=1';

      if (req.query.type) {
        queryString += ' AND type = \''+req.query.type+'\'';        
      }

      if (req.query.name) {
        queryString += ' AND name like \'%'+req.query.name+'%\'';
      }

      queryString += ' ORDER BY category.name';

      connection.query(queryString, function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        }

        var categories = new Array();
        for (var i=0; i<rows.length; i++) {
          var row = rows[i];
          var category = new Object();
          category.id = row.id;
          category.name = row.name;
          category.type = row.type;
          categories.push(category);
        }

        res.send({result: 'success', err: '', json: categories, length: rows.length});
        connection.release();
      });
    }
  })
});

router.get('/category/:id', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      connection.query('SELECT id, name, type FROM category WHERE id = '+req.params.id, function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        }

        var category = new Object();
        category.id = rows[0].id;
        category.name = rows[0].name;
        category.type = rows[0].type;

        res.send({result: 'success', err: '', json: category, length: rows.length});
        connection.release();
      });
    }
  })
});

app.listen(port);
console.log('Listening on port ' + port);