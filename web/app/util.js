var appUtils = {
  showError: function(errorMessage, autoDismiss) {
    if (typeof autoDismiss == "undefined") {
      autoDismiss = true;
    }

    if (!errorMessage) {
      $('#error').text('Unknown Error');
    } else if (errorMessage == "ECONNREFUSED") {
      $('#error').text("Failed to connect to database");
    } else {
      $('#error').text(errorMessage);
    }
    
    $('#errorContainer').fadeIn();

    if (autoDismiss) {
      window.setTimeout(function () {$('#errorContainer').fadeOut();}, 2000);
    }
  },

  checkLocalStorage: function() {
    if(typeof(Storage) == "undefined") {
        appUtils.showError("LocalStorage is required, run this on a better browser!", false);
        return false;
    } else {
      return true;
    }
  },

  checkSession: function() {
    
  }
}