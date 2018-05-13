//This file contains directory constants used in the project. Constants that are
//better off being defined in one place, and then referenced elsewhere, instead
//of being redefined every time.

const path = require('path');

const rootDir = exports.root =  path.res
const uploadsDir = exports.uploads = path.join(__dirname,"uploads");
const buildsDir = exports.builds = path.join(__dirname, "build");
const downloadsdDir = exports.downloads = path.join(__dirname, "downloads");
const gdocsExportDir = exports.gdocsExportRepo = path.join(__dirname,"gdocs-export");

