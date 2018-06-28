const express = require('express');
const logger = require('morgan');

//sub processes that will handle tasks such as downloading google documents, 
const subs = require('./sub-processes');

const app = express();

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
    subs.convertGDoc(req.params.id, function(exitCode){
            if(exitCode === 0){
                 res.status(200).end();
            }
            else{
                res.status(500).end();
            }
        }
    );
});

// Download link to the converted documents
app.get('/download-converted/:id',(req,res) => {
    const format = (req.query.format || "zip");
    const fileName = (req.query.name||req.query.id) + "." + format;
    const filePath = subs.convertedDocPath(req.params.id,format); 
        
    if(!filePath){
        res.status(404).end(`Document "${req.params.id}.${format}" was not found.`);
    }
    else{
        res.download(filePath, fileName, function(err){
            if(err){
                    console.error("ERROR: " + err + "\n" + err.stack);
                    res.status(500);
            }
            res.end();
         });
    } 
});

app.listen(/*SERVER_PORT*/);

