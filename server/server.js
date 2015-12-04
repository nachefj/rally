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

// Get scores
router.post('/team/:id/scores', function(req, res) {
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
      connection.query('SELECT id, team_id, round_number, score_value FROM score WHERE team_id = ? ORDER BY round_number', req.params.id, function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        } else {
          var scoresData = new Object();
          if (rows.length == 0) {
            scoresData.nextRoundNumber = 1;
            res.send({result: 'success', err: '', json: scoresData, length: 0});
          } else {
            scoresData.nextRoundNumber = rows[rows.length - 1].round_number + 1;
            var scores = [];

            for (var i = 0; i < rows.length; i++) {
              var score = new Object();
              score.id = rows[i].id;
              score.roundNumber = rows[i].round_number;
              score.scoreValue = rows[i].score_value;
              scores.push(score);
            }

            scoresData.scores = scores;
            res.send({result: 'success', err: '', json: scoresData, length: rows.length});
          }
        }
        connection.release();
      });
    }
  });
});

// Update scores
router.put('/team/:id/scores', function(req, res) {
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
      connection.query('UPDATE score SET score_value = ? WHERE id = ?', [req.body.scoreValue, req.body.scoreId], function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        } else {
            res.send({result: 'success', err: ''});
        }
        connection.release();
      });
    }
  });
});

// Add scores
router.post('/team/:id/scores/add', function(req, res) {
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
      connection.query('INSERT INTO score(team_id, round_number, score_value) VALUES(?, ?, ?)', [req.params.id, req.body.score.roundNumber, req.body.score.scoreValue], function(err, result) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          res.send({result: 'error', err: err.code});
        } else {
          res.send({result: 'success', err: '', json: {}, length: 0});   
        }
      });
    }
    connection.release();
  });
});

// Get Top Scores by Region (Hard coded to top 3 for now)
router.get('/scores/totals/regions', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('SQL CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      connection.query('SELECT region_number, sum(score_value) AS score_total FROM score JOIN team ON score.team_id = team.id GROUP BY region_number ORDER BY score_total DESC, region_number ASC LIMIT 3', 
        function(err, rows, fields) {
          if (err) {
            console.error(err);
            res.statusCode = 500;
            res.send({result: 'error', err: err.code});
          } else {
            res.send({result: 'success', err: '', json: rows, length: rows.length}); 
          } 
        });
    }
    connection.release();
  });
});

// Get Top Scores by Table (Hard coded to top 3 for now)
router.get('/scores/totals/tables', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('SQL CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      connection.query('SELECT table_number, sum(score_value) AS score_total FROM score JOIN team ON score.team_id = team.id GROUP BY table_number ORDER BY score_total DESC, table_number ASC LIMIT 3', 
        function(err, rows, fields) {
          if (err) {
            console.error(err);
            res.statusCode = 500;
            res.send({result: 'error', err: err.code});
          } else {
            res.send({result: 'success', err: '', json: rows, length: rows.length}); 
          } 
        });
    }
    connection.release();
  });
});

// Get Grand Total
router.get('/scores/totals/grand', function(req, res) {
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('SQL CONNECTION ERROR: ', err);
      res.statusCode = 503;
      res.send({result: 'error', err: err.code});
    } else {
      connection.query('SELECT IFNULL(SUM(score_value), 0) AS score_total FROM score', 
        function(err, rows, fields) {
          if (err) {
            console.error(err);
            res.statusCode = 500;
            res.send({result: 'error', err: err.code});
          } else {
            res.send({result: 'success', err: '', json: rows[0], length: 1}); 
          } 
        });
    }
    connection.release();
  });
});

app.listen(port);
console.log('Listening on port ' + port);