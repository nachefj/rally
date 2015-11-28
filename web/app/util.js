var appUtils = {
  showError: function(errorMessage) {
    if (!errorMessage) {
      $('#error').text('Unknown Error');
    } else if (errorMessage == "ECONNREFUSED") {
      $('#error').text("Failed to connect to database");
    } else {
      $('#error').text(errorMessage);
    }
    
    $('#errorContainer').show();
  }
}