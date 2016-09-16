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

$("*").removeAttr("style");

// var runheads = runhead.split("+++");
// var runfoots = runfoot.split("+++");

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

$("div.pagestart").remove();

// autodetect runheads and runfeet based on first-child last-child status
// user must supply true/false whether header and footer are present

// if header == true
// page.first-child.each.gsub(\W, "") >> array
// array.sort
// newarr = array.filter(^\d?$)
// newarr.length
// array.each.gsub(\d, "")
// function foo(arr) {
//     var a = [], b = [], prev;

//     arr.sort();
//     for ( var i = 0; i < arr.length; i++ ) {
//         if ( arr[i] !== prev ) {
//             a.push(arr[i]);
//             b.push(1);
//         } else {
//             b[b.length-1]++;
//         }
//         prev = arr[i];
//     }

//     return [a, b];
// }

// if footer == true
// page.last-child.each.gsub(\W, "") >> array
// if this.text = digit
// if prev.text = digit - 1 and/or next.text = digit + 1
// this.remove

// flag runhead paragraphs for removal
// $("div.pagestart").next().each(function () {
//     var text = $( this ).text();
//     var tx = text.replace(/\W/g,'');
//     for (var i = 0; i < runheads.length; i++) {
//       var item = runheads[i].replace(/\W/g,'').replace(/folio/g,'(\\d+)');
//       var pattern = "^" + item + "$";
//       var mypattern = new RegExp( pattern, "g");
//       var result = mypattern.test(tx);
//       if (result === true) {
//         $( this ).addClass("delete");
//       }
//     }
//   });

// // flag runfoot paragraphs for removal
// $("div.pagestart").prev().each(function () {
//     var text = $( this ).text();
//     var tx = text.replace(/\W/g,'');
//     for (var i = 0; i < runfoots.length; i++) {
//       var item = runfoots[i].replace(/\W/g,'').replace(/folio/g,'(\\d+)');
//       var pattern = "^" + item + "$";
//       var mypattern = new RegExp( pattern, "g");
//       var result = mypattern.test(tx);
//       if (result === true) {
//         $( this ).addClass("delete");
//       }
//     }
//   });

// remove all flagged paragraphs
$('.delete').remove();

// insert span in each break
var line = $('<span class="line"></span>');
$('br').before(line);

// move all text into the line that precedes it
// $('*').each(function () {
//       if ( $(this).prevAll('span.line') ) {
//         var prevline = $(this).prevAll('span.line');
//         parent.append($(this).contents().filter(function() { return this.nodeType === 3; }));
//       }  
//   });

// mark each line with a span tag
// $('span:first-child, br')
//   .contents()
//   .filter(function() {
//     return this.nodeType === 3;
//   }).wrap("<span class='line'></span>");

// remove the br tags
// $('br').replaceWith(function() {
//  return $('span', this);
// });

// // if line ony contains white space, remove it
// $("span.line").each(function () {
//     var text = $( this ).text();
//     var mypattern = new RegExp( "\\S", "g");
//     var result = mypattern.test(text);
//     if (result === false) {
//       $( this ).remove();
//     }
//   });

// var tighten = {};
// var loosen = {};

// // check for single lines at the top of a page
// $("div.pagestart").next().find("span.line:first-of-type").each(function () {
//     var text = $( this ).text();
//     var textlength = text.length;
//   });

// // check for single words hyphenated at the end of a paragraph
// // do this AFTER fixing pagebreaks
// $('div span.line:last-of-type').each(function () {
//     // see if only one word is one last line of para
//     var text = $( this ).text();
//     var mypattern = new RegExp( " ", "g");
//     var result = mypattern.test(text);
//     // see if the previous ine ends with a hyphen
//     var prevtext = $( this ).prev().text();
//     var mypattern2 = new RegExp( "-$", "g");
//     var result2 = mypattern2.test(prevtext);
//     // see if the parent element already has a tighten or loosen applied
//     var parentclass = $( this ).closest("div").attr("class");
//     var mypattern3 = new RegExp( "loosen|tighten", "g");
//     var result3 = mypattern3.test(parentclass);
//     if (result === false && result2 === true && result3 === false) {
//       $( this ).closest("div").addClass('loosen');
//       loosen.push(text);
//     }
//   });

  var output = $.html();
    fs.writeFile(outfile, output, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("Content has been updated!");
  });
});