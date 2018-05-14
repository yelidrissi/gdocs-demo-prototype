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
            bearer: token
        }
    };
    const targetFilePath = path.join(dirs.uploads, id+".html");
    //a write-stream into the appropriate file path
    let target = fs.createWriteStream(targetFilePath);
    try{
    request(sourceHTTPRequest, function(error, response, body){
        if (!error && response.statusCode < 400){
            target.write(body);
            target.end();
            cb(0);
        }
        else{
            console.error(`Failed to download gdoc [ "${id}",\n"${token}" ],\n`+
            `with error:\n${error||`CODE: ${response.statusCode}\nMESSAGE: ${response.statusMessage}`||"UNDEFINED"}`);
            target.end();
            fs.unlink(targetFilePath,function(err){
                if(err) console.error(err);
            });
            cb(1);
        }
    });
    }
    catch(err){
        console.error(err);
        fs.unlink(targetFilePath);
        cb(2);
    }
}

/**
 * Converts the document $id.html to $id.pdf, $id.docx and $id.rtf .
 * 
 * @param {string} id - ID of the document to be converted.
 * @param {successHandler} [cb] - Callback function to handle the exit-code of the command.
 * @param {Object} [options] - Options object to specify extra parameters for the make command, such as theme to use for conversion, etc.
 * @returns {void}
 */
function convertGDoc(id, cb, options){
    const makeParams = ["full_docker_convert",
                        "name="+id];
    if(options){
        options.keys().forEach(function(key){
            let newElement = [key,options[key]].join('=');
            makeParams.push(newElement);
        });
    }

    const makeChild = child.spawn('make', makeParams,{
        stdio: ['ignore', 'ignore', process.stderr]
    });
    makeChild.on('close',cb(exitCode));
}



/**
 * Returns the filepath to the desired converted-document.
 * 
 * @param {string} id - The ID of the converted-document that is sought.
 * @param {string} format - The format of the converted-document that is sought.
 * @returns {string|undefined} - Returns the filepath if the file exists, and nothing if it doesn't.
 */
function convertedDocPath(id, format){
    const filePath = path.join(dirs.downloads,id,id +"."+ format);
    if(fs.existsSync(filePath)){
        return filePath;
    }
    else{
        return;
    }
}

module.exports = {
    fetchGDoc: fetchGDoc,
    convertGDoc: convertGDoc,
    convertedDocPath: convertedDocPath
}
