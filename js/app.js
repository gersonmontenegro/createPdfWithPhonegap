function start(){
    document.getElementById("make_pdf").addEventListener("click", clickMake);
}

function clickMake(){
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
}
