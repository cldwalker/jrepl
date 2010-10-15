(function($) {
  var readline_offset = search_offset = 0;
  var input, input_prompt, original_prompt, startCompletion;
  var readline_history = [];

  var clear_line = function () { input.val(''); };
  var previous_line = function () {
    var val = readline_history[readline_history.length - 1 - readline_offset];
    if (val) { readline_offset +=1; }
    input.val(val);
    return false;
  };
  var next_line = function () {
    var val = readline_history[readline_history.length + 1 - readline_offset];
    if (val) { readline_offset -=1; }
    input.val(val);
    return false;
  };
  var search_history = function() {
    input.autocomplete('enable');
    original_prompt = input_prompt.text();
    input_prompt.text("(search-history):");
  }
  var get_search_history = function(term) {
    var results = [];
    $.each(readline_history, function(key,value) {
      value.match(term) && results.push(value);
    });
    return results;
  };
  var exit_search_history = function() {
    input.autocomplete('disable');
    $('ul.ui-autocomplete').hide();
    input_prompt.text(original_prompt);
  };
  var tab_complete = function() {
    input.autocomplete('enable');
    startCompletion(input.val());
    return false;
  };

  var autocomplete_history_source = function(request, response) {
    response(get_search_history(request.term));
  };

  $.fn.readline = function(options) {
    options = $.extend({
      prompt_id: this.selector + '_prompt',
      startCompletion: function(val) {},
      autocomplete_css: 'jquery.ui.autocomplete.css',
      readline_css: 'jquery.readline.css'
    }, options);
    input = $(this);
    startCompletion = options.startCompletion;
    $('head').append("<link href='"+options.autocomplete_css+"' rel='stylesheet' type='text/css'/>").
      append("<link href='"+options.readline_css+"' rel='stylesheet' type='text/css'/>");

    input.
      bind('keydown', 'ctrl+p', previous_line).
      bind('keydown', 'up', previous_line).
      bind('keydown', 'ctrl+n', next_line).
      bind('keydown', 'down', next_line).
      bind('keydown', 'ctrl+r', search_history).
      bind('keydown', 'ctrl+g', exit_search_history).
      bind('keydown', 'ctrl+u', clear_line).
      bind('keydown', 'tab', tab_complete).
      autocomplete({
        source: autocomplete_history_source,
        disabled: true,
        close: function(event, ui) { exit_search_history(); return true; }
      }).
      before('<span id="'+options.prompt_id.replace('#', '')+'"></span>');

    input_prompt = $(options.prompt_id);

    return this;
  };

  var addHistory = function(line) {
    readline_history.push(line);
    search_offset = readline_offset = 0;
  };
  var finishCompletion = function(completions) {
    var onclose = function() {
      input.autocomplete('option', {
        close: function() {},
        disabled: true,
        source: autocomplete_history_source
      });
      $('ul.ui-autocomplete').hide();
    };
    input.autocomplete('option', {
      close: onclose,
      source: completions
    });
    input.autocomplete('search');
  };

  $.readline = {
    version: '0.1.0',
    addHistory: addHistory,
    finishCompletion: finishCompletion
  };
})(jQuery);
