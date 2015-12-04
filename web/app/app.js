var app = angular.module('app', ['ngRoute']);
app.constant('appConfig', {apiUrl: 'http://localhost:3000/api'});

// Add the directive for elements with the contenteditable attribute so we can us ng-change on the div for the scores list
app.directive('contenteditable', function() {
      return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elm, attr, ngModel) {

          function updateViewValue() {
            ngModel.$setViewValue(this.innerHTML);
          }
          //Binding it to keyup, lly bind it to any other events of interest 
          //like change etc..
          elm.on('blur', updateViewValue);

          scope.$on('$destroy', function() {
            elm.off('blur', updateViewValue);
          });

          ngModel.$render = function(){
             elm.html(ngModel.$viewValue);
          }

        }
    }
});

app.directive('onFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  }
});

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl : 'app/login.html'
    })
    .when('/noaccess', {
      templateUrl : 'app/noaccess.html'
    })
    .when('/login', {
      templateUrl : 'app/login.html'
    })
    .when('/team/:id/scores', {
      templateUrl : 'app/score.html'
    })
    .when('/scoreboard', {
      templateUrl : 'app/scoreboard.html'
    })
    .when('/leaderboard', {
      templateUrl : 'app/leaderboard.html'
    })
    .otherwise({
      redirectTo: '/noaccess'
    });
});

app.factory('sessionService', ['$location', 
  function (location) {
    return {
      getSession: function () {
        return JSON.parse(localStorage.rally_session_id);
      },

      saveSession: function (team) {
        localStorage.rally_session_id = JSON.stringify(team);
      },

      checkAccess: function () {
        if (!localStorage.rally_session_id) {
          return false;
        }
        return true;
      },

      clearSession: function () {
        localStorage.removeItem("rally_session_id");
      }
    }
  }
]);

app.factory('appCheckService', function () {
  return {
    checkLocalStorage: function() {
      if(typeof(Storage) == "undefined") {
          return false;
      }
      return true;
    }
  }
});

app.controller('mainAppController', ['$compile', '$scope', '$http', '$location', 'appConfig', 'appCheckService', 'sessionService', 
  function(compile, scope, http, location, appConfig, appCheckService, sessionService) {

    if (!appCheckService.checkLocalStorage()) {
      location.path('/register');
      alert("LocalStorage is required, run this on a better browser!");
    }

    scope.appTitle = "Redline Racing";

    scope.onLogoutClick = function () {
      sessionService.clearSession();
      location.path('/login');
    }

  }
]);

app.controller('securityController', ['$compile', '$scope', '$http', '$location', 'appConfig', 'sessionService', 
  function(compile, scope, http, location, appConfig, sessionService) {

    if (!sessionService.checkAccess()) {
      sessionService.clearSession();
      location.path('/noaccess');
    }

  }
]);

app.controller('loginController', ['$compile', '$scope', '$http', '$location', 'appConfig', 'sessionService', 
  function(compile, scope, http, location, appConfig, sessionService) {

    if (sessionService.checkAccess()) {
      location.path('/team/'+sessionService.getSession().id + '/scores');
    }

    scope.onLoginClick = function() {
      var postResponse = http.post(appConfig.apiUrl + '/login', scope.team);
      postResponse.success(function(data, status, headers, config) {
        var team = data.json;

        sessionService.saveSession(team);

        location.path('/team/'+team.id+'/scores');
      });
      postResponse.error(function(data, status, headers, config) {
        if (!data) {
          appUtils.showError('Error registering');
        } else if (data.err && data.err == "ER_DUP_ENTRY") {
          appUtils.showError("Team with table number " + scope.team.tableNumber + " already exists");
        } else if (data.err) {
          appUtils.showError(data.err);
        } else {
          appUtils.showError(data);
        }
      });
    };

  }
]);

app.controller('scoreController', ['$compile', '$scope', '$http', '$location', 'appConfig', '$routeParams', 'sessionService', 
  function(compile, scope, http, location, appConfig, routeParams, sessionService) {

    // Set team name
    scope.teamName = "Region: " + sessionService.getSession().regionNumber + " Table: " + sessionService.getSession().tableNumber;

    //expose super user functions
    if (location.search().su) {
      scope.amISuperUser = true;
    } else {
      scope.amISuperUser = false;
    }
    

    // Fetch Scores
    var fetchScores = function () {

      //fetch data
      var payload = new Object();
      payload.session = sessionService.getSession();

      var getResponse = http.post(appConfig.apiUrl + '/team/' + routeParams.id + '/scores', payload);
      getResponse.success(function(data, status, headers, config) {
        var scoresData = data.json

        // set scores list
        scope.scores = scoresData.scores;

        // Set next available round number
        scope.nextRoundNumber = scoresData.nextRoundNumber;
      });
      getResponse.error(function(data, status, headers, config) {
        if (status == 403) {
          sessionService.clearSession();
          location.path('/noaccess');
        }

        if (!data) {
          appUtils.showError('Error getting scores ['+routeParams.id+']');
        } else if (data.err) {
          appUtils.showError(data.err);
        } else {
          appUtils.showError(data);
        }
      });

    }
    fetchScores();

    scope.onSwitchTeamClick = function() {
      sessionService.clearSession();
      location.path('/login');
    }

    scope.onAddScoreClick = function() {
      var payload = new Object();
      payload.session = sessionService.getSession();

      var score = new Object();
      score.scoreValue = scope.scoreEntry;
      score.roundNumber = scope.nextRoundNumber;

      payload.score = score;

      var postScoreResponse = http.post(appConfig.apiUrl + '/team/' + routeParams.id + '/scores/add', payload);
      postScoreResponse.success(function(data, status, headers, config) {
        scope.scoreEntry = '';
        fetchScores();
      });
      postScoreResponse.error(function(data, status, headers, config) {
        if (!data) {
          appUtils.showError('Error adding score');
        } else if (data.err) {
          appUtils.showError(data.err);
        } else {
          appUtils.showError(data);
        }
      });
    }

    scope.onScoreChange = function(elem, id, oldValue, newValue) {
      console.log("score changed for id = " + id + " oldValue = " + oldValue + " newValue = " + newValue + ", elem = " + elem);

      if (isNaN(Number(newValue))) {
        elem.score.scoreValue = oldValue;
        return;
      }

      var payload = new Object();
      payload.scoreValue = newValue;
      payload.scoreId = id;
      payload.session = sessionService.getSession();

      var updateScoreResponse = http.put(appConfig.apiUrl + '/team/' + routeParams.id + '/scores', payload);
      updateScoreResponse.success(function(data, status, headers, config) {
        // Good do nothing
        console.log("Score saved for id", id, "newValue", newValue);
      });
      updateScoreResponse.error(function(data, status, headers, config) {
        if (!data) {
          appUtils.showError('Error updating score');
        } else if (data.err) {
          appUtils.showError(data.err);
        } else {
          appUtils.showError(data);
        }
      });

    }

  }
]);

app.controller('scoreboardController', ['$compile', '$scope', '$http', '$location', 'appConfig', '$route', 
  function(compile, scope, http, location, appConfig, route) {

    //auto refresh logic
    window.setInterval(function () {
      window.location.reload();
    }, 60000);

    var fetchRegionTotals = function() {
      var getResponse = http.get(appConfig.apiUrl + '/scores/totals/regions?limit=3');
      getResponse.success(function(data, status, headers, config) {
        scope.regionTotals = data.json;
      });
      getResponse.error(function(data, status, headers, config) {
        if (!data) {
          appUtils.showError('Error fetching region totals');
        } else if (data.err) {
          appUtils.showError(data.err);
        } else {
          appUtils.showError(data);
        }
      });
    }
    fetchRegionTotals();

    var fetchTableTotals = function() {
      var getResponse = http.get(appConfig.apiUrl + '/scores/totals/tables?limit=3');
      getResponse.success(function(data, status, headers, config) {
        scope.tableTotals = data.json;
      });
      getResponse.error(function(data, status, headers, config) {
        if (!data) {
          appUtils.showError('Error fetching table totals');
        } else if (data.err) {
          appUtils.showError(data.err);
        } else {
          appUtils.showError(data);
        }
      });
    }
    fetchTableTotals();

    var fetchGrandTotal = function() {
      var getResponse = http.get(appConfig.apiUrl + '/scores/totals/grand');
      getResponse.success(function(data, status, headers, config) {
        scope.grandTotal = data.json;
      });
      getResponse.error(function(data, status, headers, config) {
        if (!data) {
          appUtils.showError('Error fetching grand total');
        } else if (data.err) {
          appUtils.showError(data.err);
        } else {
          appUtils.showError(data);
        }
      });
    }
    fetchGrandTotal();


    // Hacky logic to show scorebars

    //This is needed because we need to ensure that all ng-repeats have completed rendering and loading 
    //before calculating and animating scorebars
    var latch = 0;
    
    scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
      if (latch == 1) {
        calculateTableScoreIncrements();
        calculateRegionScoreIncrements();
        increment();
      }
      latch++;
    });

    var TABLE_SCORE_SCALE = 0.2405;
    var REGION_SCORE_SCALE = 0.04;
    var ANIMATION_TIME = 5000;
    var ITERATION_TIMEOUT = 10; //MIN 10, MAX 1000
    var MAX_ITERATIONS = (ANIMATION_TIME/ITERATION_TIMEOUT);
    
    var iterationCount = 0;
    var scoreBars;
    
    function calculateTableScoreIncrements() {
      var scoreBars = document.getElementsByClassName("tableScoreBar");

      for (var i=0; i<scoreBars.length; i++) {
        var delta = TABLE_SCORE_SCALE * (scoreBars[i].getAttribute("data-score")/MAX_ITERATIONS);
        scoreBars[i].setAttribute("data-increment",  delta);
      }
    }

    function calculateRegionScoreIncrements() {
      var scoreBars = document.getElementsByClassName("regionScoreBar");

      for (var i=0; i<scoreBars.length; i++) {
        var delta = REGION_SCORE_SCALE * (scoreBars[i].getAttribute("data-score")/MAX_ITERATIONS);
        scoreBars[i].setAttribute("data-increment",  delta);
      }
    }

    function increment() {
      var scoreBars = document.getElementsByClassName("scoreBar");
      iterationCount++;

      for (var i=0; i<scoreBars.length; i++) {
        var newWidth = parseFloat(scoreBars[i].style.width) + parseFloat(scoreBars[i].getAttribute("data-increment"));
        scoreBars[i].style.width = newWidth + "px";
      }

      if (iterationCount < MAX_ITERATIONS) {
        window.setTimeout(increment, ITERATION_TIMEOUT);
      }
    }
    
  }
]);

app.controller('leaderboardController', ['$compile', '$scope', '$http', '$location', 'appConfig', '$routeParams', 'sessionService', 
  function(compile, scope, http, location, appConfig, routeParams, sessionService) {

    // Set current table and region for highlighting
    scope.currentTableNumber = sessionService.getSession().tableNumber;
    scope.currentRegionNumber = sessionService.getSession().regionNumber;

    var fetchTableTotals = function() {
      var getResponse = http.get(appConfig.apiUrl + '/scores/totals/tables');
      getResponse.success(function(data, status, headers, config) {
        scope.tableTotals = data.json;
      });
      getResponse.error(function(data, status, headers, config) {
        if (!data) {
          appUtils.showError('Error fetching table totals');
        } else if (data.err) {
          appUtils.showError(data.err);
        } else {
          appUtils.showError(data);
        }
      });
    }
    fetchTableTotals();

    var fetchRegionTotals = function() {
      var getResponse = http.get(appConfig.apiUrl + '/scores/totals/regions');
      getResponse.success(function(data, status, headers, config) {
        scope.regionTotals = data.json;
      });
      getResponse.error(function(data, status, headers, config) {
        if (!data) {
          appUtils.showError('Error fetching region totals');
        } else if (data.err) {
          appUtils.showError(data.err);
        } else {
          appUtils.showError(data);
        }
      });
    }
    fetchRegionTotals();

    scope.onBackClick = function() {
      location.path('/team/'+sessionService.getSession().id + '/scores');
    }


  }
]);
