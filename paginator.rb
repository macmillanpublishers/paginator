# combine the pdf html and the source html into one file, tagged accordingly

# VARS

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

`python #{pdfminer} -o #{output_file} #{input_file}`

# cleanup.js
cleanup = "cleanup.js"
`node #{cleanup} #{output_file} #{output_file}`

# fix line wraps
rubycleanup = File.read(output_file).gsub(/(^)(<span class="line")(\/>)(.*)($)/, "\\1\\2>\\4</span>\\5")
                                    .gsub(/(^<span class="line">.*)($)(^$)/, "\\1</div>\\2\\3")
                                    .gsub(/(^)(<div><span>)(.*?)($)/, "\\1<span class=\"line\">\\3</span>\\4")

# strip nested tags in lines
rubycleanup.scan(/^<span class="line">.*<\/span>$/).each do |s|
  str = "#{s}"
  t = str.gsub(/(<\/?[a-z]*\/?>)/, "")
  rubycleanup = rubycleanup.gsub(str, t)
end

# add closing span tags
rubycleanup = rubycleanup.gsub(/(^<span class="line">.*)($)/, "\\1</span>\\2")

File.open(output_file, 'w') do |output| 
  output.puts rubycleanup
end

# cleanup2.js
cleanuptwo = "cleanup2.js"
`node #{cleanuptwo} #{output_file} #{output_file}`

burstfile = File.read(output_file).gsub(/<body>/,"<div class='burstfile'>")
                                  .gsub(/<\/body>/,"</div>")
                                  .gsub(/<html><head>/, "")
                                  .gsub(/<meta http-equiv="Content-Type" content="text\/html; charset=utf-8">/, "")
                                  .gsub(/<\/head>/, "")
                                  .gsub(/<\/html>/, "")
                                  .gsub(/<\/meta>/, "")

srcfile = File.read(input_html).gsub(/<body data-type="book">/,"<div class='srcfile'>")
                               .gsub(/<\?xml version="1.0" encoding="UTF-8"\?>/, "")
                               .gsub(/<html xmlns="http:\/\/www.w3.org\/1999\/xhtml">/, "")
                               .gsub(/<head>/, "")
                               .gsub(/<title>.*<\/title><\/head>/, "")
                               .gsub(/<\/body>/,"</div>")
                               .gsub(/<\/html>/,"")

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

# analyze.js

# analyze = "analyze.js"
# `node #{analyze} #{paginate_html}`