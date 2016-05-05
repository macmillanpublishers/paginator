var fs = require('fs');
var cheerio = require('cheerio');
var burstfile = process.argv[2];
var srcfile = process.argv[3];
var runhead = process.argv[4];
var runfoot = process.argv[5];
var outfile = "output.html";


fs.readFile(burstfile, function editContent (err, contents) {
  $ = cheerio.load(contents, {
          xmlMode: true
        });

// remove the empty spans before the page marker
$("span:empty").remove();

var runheads = runhead.split("+++");
var runfoots = runfoot.split("+++");

// add page marker
$("div a").each(function () {
      var text = $( this ).text();
      var mypattern = new RegExp( "^Page(\\s+)(\\d+)$", "g");
      var result = mypattern.test(text);
      if (result === true) {
        $( this ).parent().addClass("pagestart")
      }
  });

// flag runhead paragraphs for removal
$("div.pagestart").next().each(function () {
    var text = $( this ).text();
    var tx = text.replace(/\W/g,'');
    for (var i = 0; i < runheads.length; i++) {
      var item = runheads[i].replace(/\W/g,'').replace(/folio/g,'(\\d+)');
      var pattern = "^" + item + "$";
      var mypattern = new RegExp( pattern, "g");
      var result = mypattern.test(tx);
      if (result === true) {
        $( this ).addClass("delete");
      }
    }
  });

// flag runfoot paragraphs for removal
$("div.pagestart").prev().each(function () {
    var text = $( this ).text();
    var tx = text.replace(/\W/g,'');
    for (var i = 0; i < runfoots.length; i++) {
      var item = runfoots[i].replace(/\W/g,'').replace(/folio/g,'(\\d+)');
      var pattern = "^" + item + "$";
      var mypattern = new RegExp( pattern, "g");
      var result = mypattern.test(tx);
      if (result === true) {
        $( this ).addClass("delete");
      }
    }
  });

// remove all flagged paragraphs
$('.delete').remove();


// add some clear line markers
$('span, br')
  .contents()
  .filter(function() {
    return this.nodeType === 3;
  }).wrap("<span class='line'></span>");

// remove the br tags
$('br').replaceWith(function() {
 return $('span', this);
});

$("span.line").each(function () {
    var text = $( this ).text();
    var mypattern = new RegExp( "\\S", "g");
    var result = mypattern.test(text);
    if (result === false) {
      $( this ).remove();
    }
  });

var tighten = {};
var loosen = {};

// check for single lines at the top of a page
$("div.pagestart").next().find("span.line:first-of-type").each(function () {
    var text = $( this ).text();
    var textlength = text.length;
  });

// check for single words hyphenated at the end of a paragraph
// do this AFTER fixing pagebreaks
$('div span.line:last-of-type').each(function () {
    // see if only one word is one last line of para
    var text = $( this ).text();
    var mypattern = new RegExp( " ", "g");
    var result = mypattern.test(text);
    // see if the previous ine ends with a hyphen
    var prevtext = $( this ).prev().text();
    var mypattern2 = new RegExp( "-$", "g");
    var result2 = mypattern2.test(prevtext);
    // see if the parent element already has a tighten or loosen applied
    var parentclass = $( this ).closest("div").attr("class");
    var mypattern3 = new RegExp( "loosen|tighten", "g");
    var result3 = mypattern3.test(parentclass);
    if (result === false && result2 === true && result3 === false) {
      $( this ).closest("div").addClass('loosen');
      loosen.push(text);
    }
  });

  var output = $.html();
    fs.writeFile(outfile, output, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("Content has been updated!");
  });
});