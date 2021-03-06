var path = require('path');
var fs = require("fs");
var qs = require('querystring');
var express = require("express");
var app = express();    
app.listen(80);

var noteTemplate = "";

fs.readFile("note.htm", "utf8", function(err, file) {
    noteTemplate = file;
});

var error = function(err, res) {
    if (err) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end();
    }
}

var response = function(res, type, text) {
    res.writeHead(200, {'Content-Type': type});
    res.write(text);
    console.log(text);
    res.end();
}

app.post('/save/:path', function(req, res){
    console.log('save ' + req.params.path);
    var path = "./"+req.params.path;
    formData = '';
    req.on("data", function (chunk) {
        formData += chunk;
    });

    req.on("end", function () {
        form = qs.parse(formData);
        response(res, "text/plain", "path:"+path+" saved!<br/>\n<pre>\n" + form.note + "\n</pre>\n");
    });    
});

app.get('/note/:path', function(req, res){
    console.log('note ' + req.params.path);
    var path = "./"+req.params.path;
    fs.readFile(path, "utf8", function(err, file) {
        if (err) 
            error(err, res);
        else
            response(res, "text/html", noteTemplate.replace("[[?path?]]", req.params.path)
            .replace("[[?path?]]", req.params.path).replace("[[?fileText?]]", file));
    });
});

app.get('*', function(req, res){
    console.log('url='+req.url);
    var path = '.' + req.url;
    console.log('path='+path);
    pathStat = fs.statSync(path);
    if (pathStat.isFile()) {
        fs.readFile(path, "utf8", function(err, file) {
            if (err)
                error(err, res);
            else
                response(res, "text/html", file);
        });
    } else if (pathStat.isDirectory()) {
        console.log(path +" is a directory");
        var html = "<html><body>";
        var files = fs.readdirSync(path);
        for (f in files) {
            fname = files[f];
            console.log("file:"+fname);
			if (req.url=="/"){
				filePath = req.url+fname;
			}else{
				filePath = req.url+"/"+fname;
			}
            html += "<li><a href='"+filePath+"'>"+filePath+"</a></li>\n";
        }
        html += "<body></html>"
        response(res, "text/html", html);
    }
});

console.log('start NoteServer\n');