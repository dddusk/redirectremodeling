var lunrIndex,
    $results,
    pagesIndex;
var downcount = 0;
var selectedSearchLink = '#';

function initLunr() {
  $.getJSON("/js/lunr/PagesIndex.json").done(function(index) {
    pagesIndex = index;

    lunrIndex = lunr(function() {
      this.field("title", {
          boost: 10
      });
      this.field("content");
      this.ref("href");
    });

    pagesIndex.forEach(function(page) {
      lunrIndex.add(page);
    });
  })
  .fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.error("Error getting Hugo index flie:", err);
  });
}

// adds listener on the input field
function initUI() {
  $('#search-overlay').height($('html').height());

  $results = $("#results");

  var ctrlDown = false,
  ctrlKey = 17,
  cmdKey = 91,
  vKey = 86,
  cKey = 67,
  escKey = 27,
  downArrow = 40,
  upArrow = 38,
  enterKey = 13;

  $(document).keydown(function(e) {
    if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
  }).keyup(function(e) {
    if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;

    if ($('.page input:focus, .footer input:focus, .page textarea:focus, .footer textarea:focus, .page select:focus, .footer select:focus').length === 0) {
      $results.empty();

      var downSelected    = false;
      var clearSelected   = false;

      if ($('#search-overlay').hasClass('active')) {
        if (e.keyCode === escKey) {        // esc key clicked
          $('#search-overlay').removeClass('active');
        }
        if (e.keyCode === downArrow) { // down arrow clicked
          downSelected = true;
        }
        if (e.keyCode !== downArrow && e.keyCode !== upArrow) {
          clearSelected = true;
        }
        if (e.keyCode === enterKey && $('#results li.selected')) {
          window.location.href = selectedSearchLink;
        }
      }

      // Only trigger a search when 2 chars. at least have been provided
      var query = $('#search').val();

      if (query.length > 0) {
        $('#clear-search').addClass('active');
      } else {
        $('#clear-search').removeClass('active');
      }

      if (query.length < 2) {
        return;
      }

      var results = search(query);

      renderResults(results, query, downSelected, clearSelected);
    }
  });
}

function search(query) {
  return lunrIndex.search(query).map(function(result) {
    return pagesIndex.filter(function(page) {
      return page.href === result.ref;
    })[0];
  });
}

function renderResults(results, query, downSelected, clearSelected) {
  if (!results.length) {
    $results.append("<p class='no-results'>Unfortunately, we can't find '" + query + "'.</p>");
    return;
  }

  var pages = [],
      faculty = [];

  // sort results into 3 categories
  // var sectionsInPages = ['', 'press', 'pricing', 'support', 'tags'];

  results.forEach(function(result) {
    // if (result.section === ['', 'press', 'pricing', 'support', 'tags'] || result.section === (result.title).toLowerCase() || result.title === 'Site of the Week') {
    // if (sectionsInPages.indexOf(result.section) > -1 || result.section === (result.title).toLowerCase()) {
    if (result.section === 'faculty') {
      faculty.push(result);
    } else {
      pages.push(result);
    }
  });

  if (pages.length) {
    $results.append("<ul class='pages-results search-column'><li><h4 class='section-label'>Results</h4></li></ul>");
  }
  pages.slice(0, 7).forEach(function(result) {
    var $result = $("<li>");
    $result.append($("<a>", {
      href: result.href,
      text: decodeHtml(result.title)
    }));
    $('.pages-results').append($result);
  });

  if (faculty.length) {
    $results.append("<ul class='faculty-results search-column'><li><h4 class='section-label'>Faculty</h4></li></ul>");
  }
  faculty.slice(0, 7).forEach(function(result) {
    var $result = $("<li>");
    $result.append($("<a>", {
      href: result.href,
      text: decodeHtml(result.title)
    }));
    $('.faculty-results').append($result);
  });

  if (clearSelected) {
    downcount = 0;
  }

  if (downSelected) {

    if (downcount > 0 ) {
      $('#results li:not(.section-label)').eq(downcount).addClass('selected');
    } else {
      $('#results li:not(.section-label)').first().addClass('selected');
    }
    selectedSearchLink = $('#results li:not(.section-label).selected a').attr('href');

    if ($('#results li:not(.section-label)').last().hasClass('selected') || downcount < 0) {
      downcount = 0;
    } else {
      downcount++;
    }
  }

  function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
}

initLunr();

$(document).ready(function() {
  initUI();
});

$('#clear-search').click(function() {
  $('#search').val('').focus();
  $(this).removeClass('active');
  $('.search-column').remove();
  $('.search-button').removeClass('active');
  $('#search-overlay').removeClass('active');
});

$('.search-button').click(function() {
  $('.search-button').toggleClass('active');
  $('#search-overlay').toggleClass('active');

  if ($('#search-overlay').hasClass('active')) {
    window.scrollTo(0, 0);
    $('#search').focus();
  }
});