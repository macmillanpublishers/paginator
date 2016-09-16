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

// THIS FILE IS UNTESTED AND THE MOST INCOMPLETE

// What about space breaks? Extracts? Basically every non-text para. Can we get space info from the style attr? Can we get it from CSS?

// TO DO:
// Mark chapter breaks
// Mark every line that is followed by an abnormally-margined element
// Mark every line that is preceded by an abnormally-margined element

// LINE BREAK ADJUSTMENTS:
// last line of para is a broken word:
// IF broken word < 4chars, add class TIGHTEN to para,
//// THEN pull a line from prev page to end of this page until end of chapter
// ELSE add manual break before word

$('.burstfile span.line:last-child').addClass("endofpage");

// PAGE BREAK ADJUSTMENTS:
// Fix widowed line at top of page:
// get max allowed line count (just get the count of the second page in the first chapter that has more than two pages)
// note which lines end pages
// tag last lines of paragraphs from SRCFILE into BURSTFILE
// IF last line of paragraph is also first-child of page:
//// IF current page is verso:
////// go two pages back, get data on last-child of that page
////// IF last-child =/= end of paragraph, move last-child to following page
////// go prev page back, move last TWO children to this page
////// move two children from bottom of this and every subsequent page to next, until end of chapter
////// ELSEIF last-child == end of paragraph, grab first-child from previous page, move to current page
////// then move first TWO lines of this page to prev page, and then move two children from top of next and every subsequent page to prev, until end of chapter
//// ELSEIF current page is recto:
////// get data on last-child on this page
////// IF last-child =/= end of paragraph, go to prev page, get last-child there and move to top of this page
////// move this last-child to next page, and move last-child from every following page to top of next, til end of chapter
////// ELSEIF last-child == end of paragraph, move first-child to prev page
////// get first two children from next page, move to this page, etc. for every page til end of chapter
// on last page of chapter, count number of lines AND determine if recto or verso
// IF count < 4 AND recto == true
//// perform count - 4 to get difference (result == N)
//// grab N number of lines from prev page, move to this
// ELSEIF count < 4 AND verso == true
//// perform count - 4 rounded up to even number (result == N)
//// grab N lines from prev page and prepend to this, THEN grab N/2 lines from 2 pages back and prepend to prev page
// ELSEIF count > MAX AND recto == true
//// perform prev count to get required count for spread
//// perform count - MAX to get overflow amount (result == N)
//// IF N >= 4, grab (count - prev count) lines from this, and move to a new page
//// ELSEIF N < 4, perform 4 - N, rounded up to even number (result == M)
//// grab M + N lines from this and move to new page
//// grab M/2 lines from prev and move to this page
// ELSEIF count > MAX AND verso == true
//// perform count - MAX to get overflow amount (result == N)
//// IF N >= 4, grab N lines from this and move to new page
//// ELSEIF N < 4, grab 4 lines from this and move to new page

// IF any of the lines getting moved have a spacebreak or other non-standard element in between them, that's going to fuck things up. How to account for those?

// for each line:
$('.burstfile span.line').each(function () {
// copy line text into new var, strip tags and special chars
  var line = this;
  var linetext = $( this ).text().replace(/\W/g,'');
  //an array to check for unfound lines later
  var found = [];
  //  for each para of source html
  $('.srcfile *').each(function () {
  //  copy para text into new var, strip tags and special chars
    var para = this;
    var paratext = $( this ).text().replace(/\W/g,'');
    // check to see if it's the last line in a para ($ = end of para wildacard)
    var search = linetext + "$";
    var mypattern = new RegExp( search, "g");
    var result = mypattern.test(paratext);
    //  if the source paragraph contains the line:
    if ( paratext.indexOf(linetext) >= 0 ) {
      found.push(linetext);
      // if the source para tag is a header, tag the paragraph accordingly for breaking purposes
      if ( para.tagName == "H1" ) {
        $(line).addClass("chaptitle");
      // otherwise, if the line is also a last line, tag it accordingly
      } else if ( paratext.indexOf(linetext) && result === true ) {
        $(line).addClass("last");
      };
      // the source para has been matched, so remove it from the available matches
      // this will leave runheads and runfeet flagged for removal
      para.remove();
    }
  });
  // remove any unmatched lines.
  // This will hopefully clear out folio text as well as running elements that aren't a direct match to a source para...?
  if ( jQuery.inArray( linetext, found ) == -1 ) {
      this.remove();
    }
});

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

// write new output to file
  var output = $.html();
    fs.writeFile(outfile, output, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("Content has been updated!");
  });
});