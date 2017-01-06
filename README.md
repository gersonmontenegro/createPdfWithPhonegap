# Create Pdf With Cordova/Phonegap
Demo application that create/write (inside app folder)/move (to SD card)/open (with external application) a PDF file

This demo is about 4 tasks using Cordova/Phonegap:

1. Create a PDF file with makePDF in Javascript
2. Write a file in Phonegap Application folder
3. Move the file into a SD Card, or a more accessible location for the user
4. Open automatically that PDF file

## Preparing the project
At this part we need to execute the creation commands, add the plugins, and finally add the required JS libraries:

```
cordova create createPdfWithPhonegap
cd createPdfWithPhonegap
cordova platform add android
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-file-transfer
cordova plugin add https://github.com/pwlin/cordova-plugin-file-opener2
```
Now, inside de www folder we need to add the pdfmake library:
```
npm install pdfmake
```
In order to make a simple HTML with the neccesary, I remove some lines that came with the original index.html, and add two simple buttons

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *; img-src 'self' data: content:;">
    <meta name="format-detection" content="telephone=no">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
    <link rel="stylesheet" type="text/css" href="css/index.css">
    <title>Create PDF and Save it on Download folder</title>
</head>
<body>
<div>
    <input type="button" value="Make PDF" id="make_pdf" />
    <input type="button" value="View PDF" id="view_pdf" />
</div>
</body>
</html>
```

Course, it's neccesary add the JS Scripts just before de last body tag
```html
<script type="text/javascript" src="cordova.js"></script>
<script type="text/javascript" src="js/index.js"></script>
<script type="text/javascript" src="node_modules/jquery/jquery.min.js"></script>
<script type="text/javascript" src="node_modules/pdfmake/build/pdfmake.js"></script>
<script type="text/javascript" src="node_modules/pdfmake/build/vfs_fonts.js"></script>
<script type="text/javascript" src="js/app.js"></script>
<script type="text/javascript" src="js/process_pdf.js"></script>
```

Fine, now it's time to view the code:

#Create a PDF file with makePDF in Javascript
I make this with [pdfmake library](https://github.com/bpampuch/pdfmake), wich is perfect for my purpose. Easy to use, and has a lot of features.

First, I create the "document definition" (DD). This part it's like this because it's possible to create a custom DD independent the creating process. Then, that DD is passing like parameter to the creation.
```javascript
var docDefinition = {
  content: [
    {
      table: {
        headerRows: 1,
        widths: [ '*', 'auto', 100, '*' ],
        body: [
          [ 'First C1', 'Second C', '7hird C', 'The last one' ],
          [ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],
          [ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]
        ]
      }
    }
  ]
};
makePDF( docDefinition );
```

In the other file, the function makePDF has only one line, because we don't need nothing more, just make the file content, and convert it to a binary buffer. Then call the writeFile function to start to write in the disc our PDF file.
```javascript
function makePDF(dd){
    pdfMake.createPdf( dd ).getBuffer( onGetBuffer );
}

function onGetBuffer(buffer){
    FILE_CONTENT = buffer;
    writeFile();
}
```
Finally, the binary content is stored in *FILE_CONTENT* variable.

#Write a file in Cordova/Phonegap Application folder
[*File*](https://github.com/apache/cordova-plugin-file) plugin is required in this task.

Start calling writeFile function, which execute requestFileSystem function from window object. Really, *window.requestFileSystem* is not writing the file indeed, just verify that the deveice has enough resources for do that. 

If success, we start to get the resource for stored our content, and it's here where we really are stocking the *FILE_CONTENT* varibale in a file.

```javascript
function writeFile() {
   var type = window.TEMPORARY;
   var size = 5*1024*1024;
   window.requestFileSystem(type, size, successCallback, errorCallback)
}

function successCallback(fs) {
  fs.root.getFile(FILE_NAME_LOCAL, {create: true}, onSuccessGetFile, errorCallback);
}

function onSuccessGetFile(fileEntry){
    fileEntry.createWriter(onCreateWriter, errorCallback);
}

function onCreateWriter(fileWriter){
    fileWriter.onwriteend = onWriteEnd;
    fileWriter.onerror = onErrorWritingFile;
    var blob = new Blob([FILE_CONTENT], {type: 'application/octet-binary'});
    fileWriter.write(blob);
}
```

It's important to know that the file is stored in a hidden file. Only the application can get it normally. Otherwise, we need to use the command line for access it.

If we want do that, we need the command line in order to get the hidden file using *adb* commands:
1. Start the shell
```
adb shell
```
Prompt change a little like **root@generic_x86:/ #**
2. Open like application
```
run-as com.gersonm.pdfreportcreator
```
If we don't know it, just see the *config.xml* file to get the application *id* at the begin of the file.
3. Stand on the cache folder. Here is where our file was stored.
```
cd cache
ls -l
```
Now, if we want extract that file, we need exit to the normal user prompt. It's necessary execute the *exit* command twice, and execute adb pull:
```
adb pull /sdcard/Download/file.pdf /path/to/computer/destination/
```
#Move a file into a SD Card, or a more accessible location for the user with Cordova/Phonegap
Normally, our file it's located in a folder application that is not accessible for a user, so in order to allow to the user get the file, we need to move it, or more exactly, copy it in, for example, the default Download folder in the device. Here is where [*File-Transfer*](https://github.com/apache/cordova-plugin-file-transfer) plugin is used.

The process begin when the file is finally stored, so, in this time we call the copy function sending two parameters:
1. Source indicate the path to the original file.
2. Target indicate the final destination in the device.

```javascript
function onWriteEnd(entry){
    var sourceFilePath = cordova.file.dataDirectory + "../cache/" + FILE_NAME_LOCAL;
    FILE_TARGET_PATH = cordova.file.externalRootDirectory + DESTINATION_FOLDER + FILE_NAME;
    copyFile(sourceFilePath, FILE_TARGET_PATH);
}

function copyFile(source, target){
    var ft = new FileTransfer();
    ft.download(source, target, onCopySuccess, onCopyError);
}
```
#Open automatically a file from Cordova/Phonegap application
When copy is finished, we are ready to open the file, and that operation is possible (in this demo) thanks to [*fileOpener2*](https://github.com/pwlin/cordova-plugin-file-opener2) plugin. This one is too easy to implement:

```javascript
function openFile(){
    cordova.plugins.fileOpener2.open( FILE_TARGET_PATH, 'application/pdf',
        {
            error : onErrorOpening,
            success : onSuccessOpening
        }
    );
}
```
Normally, if *onErrorOpening* is triggered, that's because the device has not an PDF viewer application.

And that's all. Code is more explained by comments.

I hope it can be useful.
