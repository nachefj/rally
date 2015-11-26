var app = angular.module('app', ['ngRoute']);
app.constant('appConfig', {apiUrl: 'http://localhost:3000/api'});

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl : 'app/budgets.html',
      controller  : 'budgetsController'
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