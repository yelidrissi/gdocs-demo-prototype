var server = PropertiesService.getScriptProperties().setProperty('server',"http://165.227.35.8:8888/").getProperty('server');

function onOpen(e) {
    Logger.log(e);
    var ui = DocumentApp.getUi();
    ui.createAddonMenu()
        .addItem('Download document as', 'showSidebar')
        .addToUi();
}

function onInstall(e) {
    onOpen(e);
}


function showSidebar() {
    var html = HtmlService.createHtmlOutputFromFile('serverHtmlDown.html')
        //.setWidth(400)
        //.setHeight(300);
    DocumentApp.getUi()
        .showSidebar(html);
}



function sendToServer(id, token) {
    var servUpload = server + "upload/?id=" + id + "&token=" + token;
    UrlFetchApp.fetch(servUpload);
}

function convertReqToServer(id) {
    var servReq = server + "convert/" + id;
    var convertedDown = server + "convert/" + id + "?format=";

    var request = UrlFetchApp.fetch(servReq);
    if (request.getResponseCode() < 400) {
        return true;
    } else {
        return false;
    }

}

function usefulInfo() {
    var id = DocumentApp.getActiveDocument().getId();
    var name = DocumentApp.getActiveDocument().getName();
    var token = ScriptApp.getOAuthToken();
    var serverDownUrl = server + "download/" + id + "?name=" + name;

    return {
        id: id,
        name: name,
        token: token,
        url: serverDownUrl
    };
}


function getFormatUrl(id, format) {
    return [format, "https://docs.google.com/document/d/" + id + "/export?format=" + format];
}


//useless function to add drive scope
function useless(){
 var file = DriveApp.getFileById(DocumentApp.getActiveDocument().getId());
 return file.getName();
}