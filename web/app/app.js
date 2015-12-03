var app = angular.module('app', ['ngRoute']);
app.constant('appConfig', {apiUrl: 'http://localhost:3000/api'});

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
    .when('/score/:id', {
      templateUrl : 'app/score.html'
    })
    .when('/scoreboard', {
      templateUrl : 'app/scoreboard.html'
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
      location.path('/score/'+sessionService.getSession().id);
    }

    scope.onLoginClick = function() {
      var postResponse = http.post(appConfig.apiUrl + '/login', scope.team);
      postResponse.success(function(data, status, headers, config) {
        var team = data.json;

        sessionService.saveSession(team);

        location.path('/score/'+team.id);
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

    // Fetch Scores
    var fetchScores = function () {

      //fetch data
      var payload = new Object();
      payload.session = sessionService.getSession();

      var getResponse = http.post(appConfig.apiUrl + '/team/' + routeParams.id + '/scores', payload);
      getResponse.success(function(data, status, headers, config) {
        // list scores
        // set max number on scope
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
      score.value = scope.scoreEntry;
      score.roundNumber = scope.roundNumber;

      payload.score = score;

      var postScoreResponse = http.post(appConfig.apiUrl + '/team/' + routeParams.id + '/scores/add', payload);
      postScoreResponse.success(function(data, status, headers, config) {
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

  }
]);

app.controller('scoreboardController', ['$compile', '$scope', '$http', '$location', 'appConfig', 
  function(compile, scope, http, location, appConfig) {

    var SCALE = 0.3;
    var ANIMATION_TIME = 1000;
    var ITERATION_TIMEOUT = 10; //MIN 10, MAX 1000
    var MAX_ITERATIONS = (ANIMATION_TIME/ITERATION_TIMEOUT);
    
    var iterationCount = 0;
    var scoreBars;

    calculateIncrements();
    increment();
    
    function calculateIncrements() {
      var scoreBars = document.getElementsByClassName("scoreBar");

      for (var i=0; i<scoreBars.length; i++) {
        var delta = SCALE * (scoreBars[i].getAttribute("data-score")/MAX_ITERATIONS);
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












app.controller('budgetsController', ['$compile', '$scope', '$http', '$location', 'appConfig', 
  function(compile, scope, http, location, appConfig) {
    //init popover for new budget
    $('#addNewLink').popover({
      html:true,
      placement:'right',
      content:function(){
        //We are calling compile as a workaround needed in order to make ng-click work inside of popover
        return compile($($(this).data('contentwrapper')).html())(scope);
      }
    });

    //fetch budgets
    var getBudgetsResponse = http.get(appConfig.apiUrl + '/budgets');
    getBudgetsResponse.success(function(data, status, headers, config) {
        scope.budgets = data.json;

        //fetch next budget date
        var getNextBudgetDateResponse = http.get(appConfig.apiUrl + '/nextbudgetdate');
        getNextBudgetDateResponse.success(function(data, status, headers, config) {
          scope.nextBudgetMonth = data.json.month;
          scope.nextBudgetYear = data.json.year;

          //load months and years in new budget popover
          scope.months = penniesUtil.getMonths();
          scope.selectedMonth = scope.months[scope.nextBudgetMonth-1];

          scope.years = penniesUtil.getYears(scope.nextBudgetYear+1, 2);
          scope.selectedYear = scope.years[0]; //default
          for (var i=0; i<scope.years.length; i++) {
            if (scope.years[i].year == scope.nextBudgetYear) {
              scope.selectedYear = scope.years[i];
              break;    
            }
          }
        });
        getNextBudgetDateResponse.error(function(data, status, headers, config) {
          if (!data) {
            penniesUtil.showError('Error getting next budget date');
          } else if (data.err) {
            penniesUtil.showError(data.err);
          } else {
            penniesUtil.showError(data);
          }
        });
      });
    getBudgetsResponse.error(function(data, status, headers, config) {
        if (!data) {
          penniesUtil.showError('Error getting budgets');
        } else if (data.err) {
          penniesUtil.showError(data.err);
        } else {
          penniesUtil.showError(data);
        }
      });
    

    scope.createBudget = function() {
      var budget = new Object();
      budget.month = scope.selectedMonth;
      budget.year = scope.selectedYear;

      var postBudgetResponse = http.post(appConfig.apiUrl + '/budgets', budget);
      postBudgetResponse.success(function(data, status, headers, config) {
        var budget = data.json;

        location.path('/budget/'+budget.id);
      });
      postBudgetResponse.error(function(data, status, headers, config) {
        //TODO: hide popover
        if (!data) {
          penniesUtil.showError('Error saving budget');
        } else if (data.err && data.err == "ER_DUP_ENTRY") {
          penniesUtil.showError("A budget for " + budget.month.name + " " + budget.year.year + " already exists");
        } else if (data.err) {
          penniesUtil.showError(data.err);
        } else {
          penniesUtil.showError(data);
        }
      });
    };

    scope.selectBudget = function(budgetId) {
      location.path('/budget/'+budgetId);
    };
  }
]);

app.controller('budgetController', ['$compile', '$scope', '$http', '$location', '$routeParams', 'appConfig', 
  function(compile, scope, http, location, routeParams, appConfig) {
    var budgetId = routeParams.id;

    //fetch budget
    var getBudgetResponse = http.get(appConfig.apiUrl + '/budget/' + budgetId);
    getBudgetResponse.success(function(data, status, headers, config) {
        scope.budget = data.json;
      });
    getBudgetResponse.error(function(data, status, headers, config) {
        if (!data) {
          penniesUtil.showError('Error getting budget ['+routeParams.id+']');
        } else if (data.err) {
          penniesUtil.showError(data.err);
        } else {
          penniesUtil.showError(data);
        }
      });

    scope.showIncomeDetails = function() {
      var getIncomeCategoriesForBudget = http.get(appConfig.apiUrl + '/budget/' + budgetId + '/categories?type=C');
      getIncomeCategoriesForBudget.success(function(data, status, headers, config) {
        scope.categories = data.json;
      });
      getIncomeCategoriesForBudget.error(function(data, status, headers, config) {
        if (!data) {
          penniesUtil.showError('Error getting income categories');
        } else if (data.err) {
          penniesUtil.showError(data.err);
        } else {
          penniesUtil.showError(data);
        }
      });

      scope.detailTitle = 'Income Details';
      scope.showDetails = true;
    };

    scope.showExpenseDetails = function() {
      var getIncomeCategoriesForBudget = http.get(appConfig.apiUrl + '/budget/' + budgetId + '/categories?type=D');
      getIncomeCategoriesForBudget.success(function(data, status, headers, config) {
        scope.categories = data.json;
      });
      getIncomeCategoriesForBudget.error(function(data, status, headers, config) {
        if (!data) {
          penniesUtil.showError('Error getting expense categories');
        } else if (data.err) {
          penniesUtil.showError(data.err);
        } else {
          penniesUtil.showError(data);
        }
      });

      scope.detailTitle = 'Expense Details';
      scope.showDetails = true;
    };
  }
]);