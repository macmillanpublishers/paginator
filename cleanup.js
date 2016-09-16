// Run this file first, to cleanup and tag the pdf html content

var fs = require('fs');
var cheerio = require('cheerio');
var burstfile = process.argv[2];
var runhead = process.argv[4];
var runfoot = process.argv[5];
var outfile = process.argv[3];


fs.readFile(burstfile, function editContent (err, contents) {
  $ = cheerio.load(contents, {
          xmlMode: true
        });

// remove the empty spans before the page marker
$("span:empty").remove();

// removing the style attr. NB: You may actually want to preserve this, for location/margin info.
$("*").removeAttr("style");

// add page marker based on page numbers inserted by python
$("div a").each(function () {
      var aname = $( this ).attr("name");
      var mypattern = new RegExp( "\\d+", "g");
      var result = mypattern.test(aname);
      var page = $('<div class="page"></div>');
      if (result === true) {
        $( this ).parent().addClass("pagestart");
        $( this ).parent().before(page);
        page.attr("name", aname);
      }
  });

// remove extraneous divs
$("div.pagestart").remove();

// remove all flagged paragraphs
$('.delete').remove();

// insert span in each break
var line = $('<span class="line"></span>');
$('br').before(line);

// write new output to file
  var output = $.html();
    fs.writeFile(outfile, output, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("Content has been updated!");
  });
});