
## GDocs-Export:

Before anything, you will need to familiarize yourself with the [original GDocs-Export repo][gdocs-export].

Read through the guide, and once you have the code working inside the Docker container (e.g. `make docker_convert name='example'`), continue on to the rest.


***


## Building local files:

1. Before you build the package, the files that contain the code for the Node.js and Apps-Script add-on will be generic, in the sense that the server-address and server-port will be uninitialized. They're located in `./gdocs-server/code-generics/` and `./apps-script/code-generics/`.  
  * If you want to use a specific pair IP=`$ADDRESS` and Port=`$PORT` to generate the code with, do the following before we start 
```bash
export ADDRESS='your address'
export PORT='your port'
```  
  * Otherwise, skip this. you will eventually get an interactive CLI that will use your machine's public IP, and port 8080, as the default values.  
2. In order to build the server,  
  * first, install the npm packages `gulp-cli` and `forever` globally, using:
```bash
npm install -g gulp-cli forever
```
  * next, make sure you're in the `./gdocs-server/` directory, and run the following:
```bash
npm install && npm install --only=dev
npm run build
```
  * for details of what the build command does, `package.json` and `gulpfile.js` can be consulted. (in short, substitutes address+port, builds git submodule, and fixes git submodule's `Makefile`)

***

## Deploying the server:

* To run the server a child-process of your shell, simply  run `node file-server.js` inside `./gdocs-server`.
* To run the server as a daemon, use `forever start file-server.js` instead.

***

## Deploying the Add-On:

* First, you will need to create a new Apps-Script project. The [official Google guide][apps-script-guide] is straight-forward for that purpose.
* Once you have a blank project, manually copy and paste the content of `./apps-script/Code.js` into the file `Code.gs` in your Apps-Script project (it's your main file), and the content of `./apps-script/server-download.html` into a file called `server-download.html` in your project (you will have to create a new file).
* In order to test/deploy the Apps-Script project specifically as a Google-Docs Add-On, follow this [official guide][google-docs-add-on-guide].

[gdocs-export]: https://github.com/dergachev/gdocs-export
[apps-script-guide]: https://developers.google.com/apps-script/guides/projects
[google-docs-add-on-guide]: https://developers.google.com/apps-script/add-ons/test