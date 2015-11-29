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
      $('#error').html(errorMessage);
    }
    
    $('#errorContainer').fadeIn();

    if (autoDismiss) {
      window.setTimeout(function () {$('#errorContainer').fadeOut();}, 2000);
    }
  },

  hideError: function() {
    $('#errorContainer').fadeOut();
  }
}