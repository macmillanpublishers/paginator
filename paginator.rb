burstfile = File.read("pythonfile.html").gsub(/<body>/,"<div class='burstfile'>").gsub(/<\/body>/,"</div>")
srcfile = File.read("source.html").gsub(/<body>/,"<div class='srcfile'>").gsub(/<\/body>/,"</div>")
