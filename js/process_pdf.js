var FILE_NAME_LOCAL = "report.pdf";
var FILE_NAME = "report.pdf";
var FILE_CONTENT = null;
var DESTINATION_FOLDER = "Download/";
var FILE_WRITER = null;
var FILE_TARGET_PATH = "";

var MSG_FILE_SUCCESS = "File copy success";
var MSG_FILE_FAIL = "Error moving the file";
var MSG_FILE_OPENING = "File opened successfully";

function makePDF(dd){
    pdfMake.createPdf( dd ).getBuffer( onGetBuffer );
}

function onGetBuffer(buffer){
    FILE_CONTENT = buffer;
    writeFile();
}

//Write file to app folder
function onWriteEnd(entry){
    //dataDirectory is pointing to files folder, but our file is inside cache folder, at the same level that files
    var sourceFilePath = cordova.file.dataDirectory + "../cache/" + FILE_NAME_LOCAL;
    //externalRootDirectory is pointing to the root of SD Card
    FILE_TARGET_PATH = cordova.file.externalRootDirectory + DESTINATION_FOLDER + FILE_NAME;
    //once file creating is done, we've to copy the file from app folder, to a more asequible one,
    //in this case, Download, described by DESTINATION_FOLDER variable
    copyFile(sourceFilePath, FILE_TARGET_PATH);
}

function onErrorWritingFile(error){
    alert('Write failed: ' + error.toString());
}

//writeFile start the creating process
function writeFile() {
   var type = window.TEMPORARY;
   var size = 5*1024*1024;
   window.requestFileSystem(type, size, successCallback, errorCallback)
}

//If request is success, successCallback is invoked with a FileSystem object
function successCallback(fs) {
  fs.root.getFile(FILE_NAME_LOCAL, {create: true}, onSuccessGetFile, errorCallback);
}

//if getFile success, onSuccessGetFile writer is starting
function onSuccessGetFile(fileEntry){
    fileEntry.createWriter(onCreateWriter, errorCallback);
}

//If createWriter success, the data is put on the file through Blob class with binary type, because our file is not plain, is PDF
function onCreateWriter(fileWriter){
    fileWriter.onwriteend = onWriteEnd;
    fileWriter.onerror = onErrorWritingFile;
    var blob = new Blob([FILE_CONTENT], {type: 'application/octet-binary'});
    fileWriter.write(blob);
}

function errorCallback(error) {
  alert("ERROR: " + error.code)
}
//end write file

//Copy file to SDcard through FileTransfer class
function copyFile(source, target){
    var ft = new FileTransfer();
    //source is the path of the original file inside the app folder
    //target is the destination path
    ft.download(source, target, onCopySuccess, onCopyError);
}

//if transfer is done, onCopySuccess show up a message
function onCopySuccess(entry){
    alert(MSG_FILE_SUCCESS)
   viewPDF();
}

function onCopyError(error){
   alert(MSG_FILE_FAIL);
}

//end Copy file

//visualize the PDF
function viewPDF(){
    console.debug("<<<<<<<<<<<<<<<<<<");
    //console.debug("=>" + cordova.plugins.fileOpener2);
    //console.debug(FILE_TARGET_PATH);
    openFile();
    //PDFObject.embed(FILE_TARGET_PATH);
    //$("#pdf_link").attr("href", FILE_TARGET_PATH);
    //window.open(FILE_TARGET_PATH, "_blank", "location=yes");
}

function openFile(){
    cordova.plugins.fileOpener2.open( FILE_TARGET_PATH, 'application/pdf',
        {
            error : onErrorOpening,
            success : onSuccessOpening
        }
    );
}

function onSuccessOpening(){
    if(MSG_FILE_OPENING != ""){
        alert(MSG_FILE_OPENING);
    }
}

function onErrorOpening(error){
    alert('Error status: ' + error.status + ' - Error message: ' + error.message);
}
//end visualize the PDF