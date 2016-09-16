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

// remove any empty spans
$('span:empty').remove();

// append all lines to their corresponding page parent
$('span.line').each(function () {
      if ( $(this).prev('div.page') ) {
        var parent = $(this).prev('div.page');
        parent.append($(this));
      }  
  });

// write new output to file
  var output = $.html();
    fs.writeFile(outfile, output, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("Content has been updated!");
  });
});