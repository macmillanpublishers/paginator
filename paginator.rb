# VARIABLES
unescapeargv = ARGV[0].chomp('"').reverse.chomp('"').reverse
input_file = File.expand_path(unescapeargv).split(Regexp.union(*[File::SEPARATOR, File::ALT_SEPARATOR].compact)).join(File::SEPARATOR)
filename_split = input_file.split(Regexp.union(*[File::SEPARATOR, File::ALT_SEPARATOR].compact)).pop
filename = input_file.split(Regexp.union(*[File::SEPARATOR, File::ALT_SEPARATOR].compact)).pop.rpartition('.').first.gsub(/ /, "")
output_file = "#{filename}.html"
input_html = ARGV[1].chomp('"').reverse.chomp('"').reverse
input_html = File.expand_path(input_html).split(Regexp.union(*[File::SEPARATOR, File::ALT_SEPARATOR].compact)).join(File::SEPARATOR)
paginate_html = "paginate.html"

# Location: /Users/nellie.mckesson/tools/pdfminer-20140328
# Docs:     file:///Users/nellie.mckesson/tools/pdfminer-20140328/docs/index.html
# Github:   https://github.com/euske/pdfminer
pdfminer = "/Users/nellie.mckesson/tools/pdfminer-20140328/tools/pdf2txt.py"

# extract the html from the PDF
`python #{pdfminer} -o #{output_file} #{input_file}`

# run a first round of js cleanup
cleanup = "cleanup.js"
`node #{cleanup} #{output_file} #{output_file}`

# get the cleaned-up extracted html and fix line wraps
rubycleanup = File.read(output_file).gsub(/(^)(<span class="line")(\/>)(.*)($)/, "\\1\\2>\\4</span>\\5")
                                    .gsub(/(^<span class="line">.*)($)(^$)/, "\\1</div>\\2\\3")
                                    .gsub(/(^)(<div><span>)(.*?)($)/, "\\1<span class=\"line\">\\3</span>\\4")

# then strip nested tags in lines
rubycleanup.scan(/^<span class="line">.*<\/span>$/).each do |s|
  str = "#{s}"
  t = str.gsub(/(<\/?[a-z]*\/?>)/, "")
  rubycleanup = rubycleanup.gsub(str, t)
end

# then add closing span tags, to create a clean and wrapped line
rubycleanup = rubycleanup.gsub(/(^<span class="line">.*)($)/, "\\1</span>\\2")

# write the cleaned-up html back to a file
File.open(output_file, 'w') do |output| 
  output.puts rubycleanup
end

# run a second round of js cleanup on the cleaned up html
cleanuptwo = "cleanup2.js"
`node #{cleanuptwo} #{output_file} #{output_file}`

# get the final, cleaned-up and extracted PDF html, and prep for analysis
burstfile = File.read(output_file).gsub(/<body>/,"<div class='burstfile'>")
                                  .gsub(/<\/body>/,"</div>")
                                  .gsub(/<html><head>/, "")
                                  .gsub(/<meta http-equiv="Content-Type" content="text\/html; charset=utf-8">/, "")
                                  .gsub(/<\/head>/, "")
                                  .gsub(/<\/html>/, "")
                                  .gsub(/<\/meta>/, "")

# get the source html, and prep for analysis
srcfile = File.read(input_html).gsub(/<body data-type="book">/,"<div class='srcfile'>")
                               .gsub(/<\?xml version="1.0" encoding="UTF-8"\?>/, "")
                               .gsub(/<html xmlns="http:\/\/www.w3.org\/1999\/xhtml">/, "")
                               .gsub(/<head>/, "")
                               .gsub(/<title>.*<\/title><\/head>/, "")
                               .gsub(/<\/body>/,"</div>")
                               .gsub(/<\/html>/,"")

# write both the cleanup-up extracted PDF html AND the source html to a single file, for analiysis and re-breaking
File.open(paginate_html, 'w') do |output| 
  output.puts "<html>"
  output.puts "<head>"
  output.puts "<title>Repagination for #{filename}</title>"
  output.puts "</head>"
  output.puts "<body>"
  output.puts burstfile
  output.puts srcfile
  output.puts "</body>"
  output.puts "</html>"
end

# run the analysis and re-breaking
# analyze = "analyze.js"
# `node #{analyze} #{paginate_html}`