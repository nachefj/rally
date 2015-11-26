var penniesUtil = {
  showError: function(errorMessage) {
    if (!errorMessage) {
      $('#error').text('Unknown Error');
    } else if (errorMessage == "ECONNREFUSED") {
      $('#error').text("Failed to connect to database");
    } else {
      $('#error').text(errorMessage);
    }
    
    $('#errorContainer').show();
  },

  getMonths: function() {
    return [{id: 1, name: 'January'}, 
      {id: 2, name: 'February'},
      {id: 3, name: 'March'},
      {id: 4, name: 'April'},
      {id: 5, name: 'May'},
      {id: 6, name: 'June'},
      {id: 7, name: 'July'},
      {id: 8, name: 'August'},
      {id: 9, name: 'September'},
      {id: 10, name: 'October'},
      {id: 11, name: 'November'},
      {id: 12, name: 'December'}];
  },

  getYears: function(maxYear, yearsBefore) {
    var years = [];

    for (var i=0; i<=yearsBefore; i++) {
      var year = new Object();
      year.year = maxYear - (yearsBefore - i);
      years.push(year);
    }    

    return years;
  }
}