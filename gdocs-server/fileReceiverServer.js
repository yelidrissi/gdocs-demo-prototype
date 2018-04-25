var {downDocCommand} = require('./GDoc');

var express = require('express');
var {exec} = require('child_process');
var process = require('process');
var http = require('http');
var logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.get('/upload', (req,res) => {
    command = downDocCommand(req.query.id,req.query.id,req.query.token);
    exec(command);
    res.status(200).end();
})
app.get('/download/:id', (req,res) => {
    var file = __dirname + `/downloads/${req.params.id}.html`;
    res.download(file, (req.query.name||req.params.id)+'.html', function(err){
    if (err){
        console.log("ERROR: " + err)
        res.status(404).end(`A document with the ID "${req.params.id}" was not found.`);
    }else{res.end();};});

})

app.listen(8000);

