'use strict';

// `gulp` is the build system that this file is for.
const gulp = require('gulp');
const replace = require('gulp-replace');
const rename = require('gulp-rename');

// Standard lib.
const stream = require('stream');
const fs = require('fs');
const assert = require('assert');

// `execSync` is used to execute shell commands synchronously, and receive the output as a byte buffer.
const { execSync } = require('child_process');


// `deasync` is a module (that wraps C++ code) that makes asynchronous Node.js functions with the standard callback format synchronous.
const deasync = require('deasync');


// `stdio` is used for CLI interactivity, but it can be used for more.
const stdio = require('stdio');
const question = deasync(stdio.question);


// `ttySeperator` will be used to separate different sections of stdout, for visual clarity.
const ttySeparator = "" + "-".repeat(process.stdout.columns || 0)+"\n";

// Build JSON config file that has the server's IP address (or domain name) and port number.
gulp.task('build-local-config', function(){

    // Attempt to fetch the environmental variables "ADDRESS" and "PORT" from the parent process.
    let serverAddress = process.env['ADDRESS'];
    let serverPort = process.env['PORT'];

    // CLI-user-prompt template to confirm usage of default value.
    const questionPrompt = (envVarName, envVarDefault)=> `The environmental variable \$${envVarName} is not set.\nDo you want to use the default value "${envVarDefault}" for it? "`

    if(serverAddress && serverPort){
        process.stdout.write(ttySeparator);
        let userInput = question(`The values that are going to be used for the server IP and the server port are going to be "${serverAddress}" and ${serverPort} respectively.\nAre you okay with that? `, 'yn'.split(''));
        if((/n/i).test(userInput)) { serverAddress=""; serverPort=""; console.log(ttySeparator+"\n....Clearing environmental variables....")}
    }

    if(!serverAddress){
        // The `try` block attempts to fetch the current host's IP address using httpbin.org 's API.
        // `execSync` + `curl` had to be used because all the HTTP (and other TCP) operations in the Node.js standard library are asynchronous.
        // In case of failure, the `serverAddress` remains empty.
        try{
            process.stdout.write(ttySeparator);
            JSON.parse(
                    execSync('curl -s -X GET "https://httpbin.org/ip"', { encoding: "ASCII" }),
                    function(key, value){
                        if(key.includes("origin")){ serverAddress = value; }
                        debugger;                
                    }
            );
            let userInput = question(questionPrompt("ADDRESS", serverAddress), 'yn'.split(''));
            if((/n/i).test(userInput)) { process.exit(3); } 
            debugger;           

        } catch(err){
            process.stderr.write(err + "\n" + ttySeparator);
            process.exit(4);
        }
    }
    if(!serverPort) {
        process.stdout.write(ttySeparator);

        serverPort = '8080';
        let userInput = question(questionPrompt("PORT", serverPort), 'yn'.split(''));
        if((/n/i).test(userInput)) { process.exit(3); }
        
    } 

    process.stdout.write(ttySeparator);
    
    const configJson = JSON.stringify({ ADDRESS: serverAddress, PORT: serverPort }, null, 2);
    //return gulp.dest('./server_config.json').end(configJson);
    return fs.writeFileSync('./server-config.json', configJson);

});

// Substitute all relevant string occurences in our generics with their actualized value, 
// based on the JSON config file.

// For our Node.js server files.
gulp.task('build-local-server-files', function(){
    let config;
    try{
        config = require('./server-config.json');
        assert.ok(config.hasOwnProperty('ADDRESS')&&config.hasOwnProperty('PORT'), "Bad JSON configuration file './server-config.json' .");
    } catch(err) {
        console.error(err);
        process.exit(10);
    }
    return gulp.src('./code-generics/*')
        .pipe(replace('/*SERVER_PORT*/', config.PORT))
        .pipe(replace('/*SERVER_URL*/', config.ADDRESS))
        .pipe(rename( function(filepath){
            filepath.basename = filepath.basename.replace('.generic','');
        }))
        .pipe(gulp.dest('./'));

});

// Substitute all relevant string occurences in our generics with their actualized value, 
// based on the JSON config file.

// For our apps-script.

gulp.task('build-local-apps-script-files', function(){
    let config;
    try{
        config = require('./server-config.json');
        assert.ok(config.hasOwnProperty('ADDRESS')&&config.hasOwnProperty('PORT'), "Bad JSON configuration file './server-config.json' .");
    } catch(err) {
        console.error(err);
        process.exit(10);
    }
    return gulp.src('../apps-script/code-generics/*')
        .pipe(replace('/*SERVER_PORT*/', config.PORT))
        .pipe(replace('/*SERVER_URL*/', config.ADDRESS))
        .pipe(rename( function(filepath){
            filepath.basename = filepath.basename.replace('.generic','');
        }))
        .pipe(gulp.dest('./', {cwd: "../apps-script"}));

});

// Substitute all relevant string occurences in our generics with their actualized value, 
// based on the JSON config file.

gulp.task('build-local-files', ['build-local-server-files','build-local-apps-script-files']);

// Build local files.

gulp.task('build-local', ['build-local-config', 'build-local-files']);


// Fetch the git submodule.
gulp.task('build-git-submodule', function(){
    execSync('git submodule update --init --recursive');
});

// Repairs its Makefile.
gulp.task('repair-git-submodule-makefile', function(){
    return gulp.src('./gdocs-export/Makefile')
        .pipe(replace('latexmk -pdf $(name)', 'rubber -d $(name).tex'))
        .pipe(gulp.dest('./gdocs-export'));
});

// Chained commands.
gulp.task('build-git', ['build-git-submodule', 'repair-git-submodule-makefile']);

// Custom utilities to be used through out the code.

// Print helpful advice if the parent process exits with specific exit code.
process.on('exit', (exitCode) => {
    
    switch(exitCode) {
        case 0:
            break;
        case 3:
            process.stderr.write("\n"+ ttySeparator + "EXIT-NOTE: To set environmental variables (example: $ENV_VAR) next time, "
            + "use the following shell command before executing again:\n"
            + "\texport ENV_VAR='your desired value for the variable'\n"
            + ttySeparator
            );
            break;
        case 4:
            process.stderr.write("\n" + ttySeparator + "EXIT-NOTE: Your environmental variable $ADDRESS was not set," 
            + "and your public-facing IP address could not be fetched from the internet to be used"
            + "as the default value. Please use the following shell command before executing again:\n"
            + "\texport ENV_VAR='your desired value for the variable'\n"
            + ttySeparator
            + "P.S: Don't use a loopback or private LAN address for the server if you want to test interactivity with"
            + " the Google Apps-Script add-on, because all it's computed in the Google Cloud.\n"
            + ttySeparator
            );
            break;
        default:
            process.stderr.write("Process crashed unexpectedly with exit code " + exitCode + ".\n");
    }
    return;
})
