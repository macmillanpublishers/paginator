var fs = require('fs');
var cheerio = require('cheerio');
var htmlfile = process.argv[2];
var runhead = process.argv[4];
var runfoot = process.argv[5];
var outfile = "output.html";


fs.readFile(htmlfile, function editContent (err, contents) {
  $ = cheerio.load(contents, {
          xmlMode: true
        });

// tag pages
$('.burstfile div.pagestart + div').addClass('page');

// for each line:
$('.burstfile span.line:last-of-type').each(function () {
// copy line text into new var, strip tags and special chars
  var line = this;
  var linetext = $( this ).text().replace(/\W/g,'');
  //an array to check for unfound lines
  var found = [];
//  for each para of source html
  $('.srcfile *').each(function () {
//  copy para text into new var, strip tags and special chars
    var para = this;
    var paratext = $( this ).text().replace(/\W/g,'');
    var search = linetext + "$";
    var mypattern = new RegExp( search, "g");
    var result = mypattern.test(paratext);
//  if para.stripped index of line.stripped:
    if ( paratext.indexOf(linetext) >= 0 ) {
      found.push(linetext);
      if ( para.tagName == "H1" ) {
        $(line).addClass("chaptitle");
      } else if ( paratext.indexOf(linetext) && result === true ) {
        $(line).addClass("last");
      }
    }
  });
  if ( jQuery.inArray( linetext, found ) == -1 ) {
      this.remove();
    }
});

// check for single lines at the top of a page
// if found, get line width
// get prev para height
// if line width is 10% and prev para height is > 3 lines, tighten that para
// otherwise get heights of all paras on prev page
// get last line lengths of all paras on prev page
// don't count single paras
// if a para exists with last line width =< 10% and height > 3 line, tighten that para
// elsif a para exists with last line width >= 80% and height > 4 lines, loosen that para
// elsif a para exists with last line width >= 95% and height > 3 lines, loosen that para
// else abort
// if not aborted:
// if this is last page of chapter, stop npw.
// elsif solution was to tighten:
//   if a para exists with last line width >= 80% and height > 4 lines and NOT last para, loosen that para
//   elsif a para exists with last line width >= 95% and height > 3 lines and NOT last para, loosen that para
//   else abort the whole thing
// elsif solution was to loosen:
// on this page, find para with 
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