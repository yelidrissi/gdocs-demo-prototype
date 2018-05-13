const child = require('child_process');
const fs = require('fs');
const url = require('url');
const path = require('path');


const request = require('request');

const dirs = require('./directories');


/** 
 * Receives exit-code of the process it's meant to handle, and handles it.
 * 
 * @callback successHandler 
 * @param {number} exitCode - Exit-code of our download attempt. 0 if successful, >0 otherwise.
 * @returns {void}
 */ 
function successHandler(exitCode){}

/**
 * Fetches the Google document of ID 'id' and stores it in our server.
 * 
 * @param {string} id - The ID of the Google-Document that we're fetching.
 * @param {string} token - The OAuth2.0 token to enable us to download the Google-Document.
 * @param {successHandler} [cb] - The optional callback function that handles success or failure.
 * @returns {void} - Void asynchronous function, returns nothing.
 */
function fetchGDoc(id, token, cb){
    //http request object
    let sourceHTTPRequest = {
        method: "GET",
        url: url.format({
            protocol: "https",
            hostname: "docs.google.com",
            pathname: "/document/d/" + id + "/export",
            query: {
                format: "html"
            }
        }),
        auth: {
            'bearer': token
        }
    };
    //a write-stream into the appropriate file path
    let target = fs.createWriteStream(path.join(dirs.uploads, id+".html"));
    
    request(sourceHTTPRequest, function(error, response, body){
        if (!error && response.statusCode < 400){
            target.write(body);
            target.end();
            cb(0);
        }
        else{
            target.end();
            cb(1);
        }
    });
}

function convertGDoc(id, cb){
    const makeParams = [];
    const childProcess = child.spawn('make', makeParams,{
        stdio: ['ignore', 'ignore', process.stderr]
    });


}

module.exports = {
    fetchGDoc: fetchGDoc,
    convertGDoc: convertGDoc
}
