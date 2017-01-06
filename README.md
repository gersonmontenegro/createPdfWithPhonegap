# createPdfWithPhonegap
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
#Write a file in Phonegap Application folder
