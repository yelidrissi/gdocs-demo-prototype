var { downDocCommand, convertDocCommand } = require('./GDoc');

var express = require('express');
var {execSync} = require('child_process');
var process = require('process');
var http = require('http');
var logger = require('morgan');

//sub processes that will handle tasks such as downloading google documents, 
const subs = require('./subprocesses');

var app = express();

app.use(logger('dev'));

// Downloading GDoc using the info (doc_id + token) passed from our G-Apps-Script 
app.get('/upload/:id', (req,res) => {
    subs.fetchGDoc(req.params.id,req.query.token, function(exitCode){
        if(exitCode===0) res.status(200).end();
        else res.status(401).end();
    });
});

// Prompt the server to convert the document of a given doc_id
app.get('/convert/:id', (req,res) => {
    command = convertDocCommand(req.params.id);
    execSync(command);
    res.status(200).end();
});

// Download link to the exported HTML document
app.get('/download/:id', (req,res) => {
    var file = __dirname + `/downloads/${req.params.id}.html`;
    res.download(file, (req.query.name||req.params.id)+'.html', function(err){
    if (err){
        console.log("ERROR: " + err)
        res.status(404).end(`A document with the ID "${req.params.id}" was not found.`);
    }else{res.end();};});

});

app.get('/download-converted/:id',(req,res) => {
    var path = ((foo) => __dirname + `/converted/${req.params.id}/${req.params.id}.${foo}`);
    var format = (req.query.format || "zip");
    var filename = (req.query.name||req.params.id) + "." + format;

    if(["pdf","docx","rtf","zip"].includes(format)){
        res.download(path(format), filename, function(err){
        if(err){
            console.log("ERROR: " + err)
            res.status(404).end(`Converted documents with the ID "${req.params.id}" were not found.`)
        } else{res.end();};
        });
    } else{res.status(404).end(`The format ".${format}" is not supported by the service.`);};

})

app.listen(8888);

