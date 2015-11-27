var app = angular.module('app', ['ngRoute']);
app.constant('appConfig', {apiUrl: 'http://localhost:3000/api'});

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl : 'app/login.html',
      controller  : 'loginController'
    })
    .when('/score', {
      templateUrl : 'app/score.html',
      controller  : 'scoreController'
    })
    .when('/scoreboard', {
      templateUrl : 'app/scoreboard.html',
      controller  : 'scoreboardController'
    })
    .when('/budgets', {
      templateUrl : 'app/budgets.html',
      controller  : 'budgetsController'
    })
    .when('/budget/:id', {
      templateUrl : 'app/budget.html',
      controller  : 'budgetController'
    });
});

app.controller('loginController', ['$compile', '$scope', '$http', '$location', 'appConfig', 
  function(compile, scope, http, location, appConfig) {
    
    scope.onLoginClick = function() {
      location.path('/score'); //TODO: Add team ID
    }
  }
]);

app.controller('scoreController', ['$compile', '$scope', '$http', '$location', 'appConfig', 
  function(compile, scope, http, location, appConfig) {
    
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