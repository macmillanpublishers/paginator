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

// flag runhead paragraphs for removal
var runheads = runhead.split("+++");

var getTextNodesIn = function(el) {
    return $(el).find(":not(iframe)").addBack().contents().filter(function() {
        return this.nodeType == 3;
    });
};

$("div").each(function () {
      var text = $( this ).text();
      var tx = text.replace(/\W/g,'');
      var sibling = $( this ).prev().find("a").text();
      var mypattern2 = new RegExp( "^Page(\\s+)(\\d+)$", "g");
      var result2 = mypattern2.test(sibling);
      if (result2 === true) {
        for (var i = 0; i < runheads.length; i++) {
          var item = runheads[i].replace(/\W/g,'');
          var mypattern = new RegExp( tx, "g");
          var result = mypattern.test(item);
          if (result === true) {
            $( this ).addClass("delete");
          }
        }
      }
  });

// flag runfoot paragraphs for removal
$("div span").each(function () {
      var text = $( this ).clone().children().remove().end().text();
      var mypattern1 = new RegExp( "^(\\d+)$", "g");
      var result1 = mypattern1.test(text);
      var sibling = $( this ).parent().next().find("a").text();
      var mypattern2 = new RegExp( "^Page(\\s+)(\\d+)$", "g");
      var result2 = mypattern2.test(sibling);
      if (result1 === true && result2 === true) {
        $( this ).parent().addClass("delete");
      }
  });

// remove all flagged paragraphs
$('.delete').remove();

// do content analysis

  var output = $.html();
    fs.writeFile(outfile, output, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("Content has been updated!");
  });
});