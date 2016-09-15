# Pagination Rules

Prince has it's own pagination rules and hierarchy, influenced by the CSS that we supply. These rules don't quite meet Macmillan's quality standards. We need to repaginate to enforce the following:

* Last line of multi-line paragraph at top of page: avoid (single line ending page = OK)
* Acceptable (if necessary) if line is at least 45 characters, but not preferred.
* Last page of chapter should have ideally 4 lines or more. 3 lines is acceptable.
* Facing pages of a spread should always have the same number of lines
* Hyphenation across pages = OK if at least 4 characters after hyphen; otherwise, rebreak the line by tightening or loosening the character spacing.
* OK to hyphenate the last word of a paragraph if at least 4 characters after the hyphen (not including punctuation). More characters is better, obviously. If less than 4 characters, rebreak the line.
* Last line of paragraphs should not be shorter than 4 characters (including punctuation). Ex: if the last line of a paragraph ends with /it./ or /I."/, tighten or loosen to rebreak the line. 
* If a spacebreak is that last paragraph on a page, it should get an "ornament" class applied

# Approach

Given that the PDF conversion engine may change at some point, the most sustainable method seems to be to do an initial conversion to PDF, and then extract the pagination data from that, and adjust to accomodate Macmillan's additional rules. Ideally a book conversion will consist of no more than TWO conversions to PDF (an initial conversion to get pagination, and then a final conversion with the additional manual pagination rules applied).

There's a Python library called PDFMiner that can extract this data from a PDF, as txt, HTML, or XML. I've found the HTML to be most useful. There may be other better libraries though, so use the tool that seems best to you.

Basic process:

* Extract text from PDF, preserving line and page breaks
* Strip excess information (running headers and footers, etc.)
* Analyze breaks
* Tag source HTML with new break information (essentially manually page-breaking the book). In order to do thisand preserve balanced pages, we can set up 3 allowable line count values (the number of lines allowed per page). The first pagination will always paginate using the middle line count; when re-paginating, move lines to the next or previous page and shift to the shorter or longer line count as needed.

# The Variables

This would be relatively straightforward if we were only working with solid blocks of text. However, our books also include elements that have varying top/bottom margins, padding, line heights, etc. Space breaks are the most common of these (inserting a vertical space between paragraphs, to indicate passage of time or location), but there are many more (extracts, letters, sidebars, computer text, etc.). I'd prefer not to have to supply a list of all possible variations and their margin values, because new styles could be added, and we have different design templates that include different values. Ideally, you'd find a way to extract and account for these kinds of extra spaces from the PDF (PDFMiner preserves page position in the style attribute in HTML output--perhaps this could be used?).