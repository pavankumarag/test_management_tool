

$(document).ready(function () {
    $(document).on('click', '.cta', function () {
        $(this).toggleClass('active')
    })
});


$(document).ready(function(){
    $(".hamburger").click(function(){
        $('.sidebar-menu').removeClass("flowHide");  
        $(".sidebar-menu").toggleClass("full-side-bar");
        $('.nav-link-name').toggleClass('name-hide');        
    });
});





 $(document).ready(function () {    
      $(".nav-link").hover(function () {           
          $('.sidebar-menu').removeClass("flowHide");  
          $(this).addClass('tax-active');
              
      }, function () {
          $('.sidebar-menu')
             .addClass("flowHide");
          $(this).removeClass('tax-active');
             
      });    
  });

  $(function(){
    $('[data-toggle="tooltip"]').tooltip();
    $(".side-nav .collapse").on("hide.bs.collapse", function() {                   
        $(this).prev().find(".fa").eq(1).removeClass("fa-angle-right").addClass("fa-angle-down");
    });
    $('.side-nav .collapse').on("show.bs.collapse", function() {                        
        $(this).prev().find(".fa").eq(1).removeClass("fa-angle-down").addClass("fa-angle-right");        
    });
})



/*$(document).ready(function () {
    $('#dtBasicExample').DataTable({
      "pagingType": "simple_numbers" // "simple" option for 'Previous' and 'Next' buttons only
    });
    $('.dataTables_length').addClass('bs-select');
  });*/

  /*$(document).ready(function () {
    $('#dtBasicExample').DataTable();
  });*/

  var editor; // use a global for the submit and return data rendering in the examples

  // Display an Editor form that allows the user to pick the CSV data to apply to each column
function selectColumns ( editor, csv, header ) {
    var selectEditor = new $.fn.dataTable.Editor();
    var fields = editor.order();
 
    for ( var i=0 ; i<fields.length ; i++ ) {
        var field = editor.field( fields[i] );
 
        selectEditor.add( {
            label: field.label(),
            name: field.name(),
            type: 'select',
            options: header,
            def: header[i]
        } );
    }
 
    selectEditor.create({
        title: 'Map CSV fields',
        buttons: 'Import '+csv.length+' records',
        message: 'Select the CSV column you want to use the data from for each field.'
    });
 
    selectEditor.on('submitComplete', function (e, json, data, action) {
        // Use the host Editor instance to show a multi-row create form allowing the user to submit the data.
        editor.create( csv.length, {
            title: 'Confirm import',
            buttons: 'Submit',
            message: 'Click the <i>Submit</i> button to confirm the import of '+csv.length+' rows of data. Optionally, override the value for a field to set a common value by clicking on the field below.'
        } );
 
        for ( var i=0 ; i<fields.length ; i++ ) {
            var field = editor.field( fields[i] );
            var mapped = data[ field.name() ];
 
            for ( var j=0 ; j<csv.length ; j++ ) {
                field.multiSet( j, csv[j][mapped] );
            }
        }
    } );
}
 
$(document).ready(function() {
    editor = new $.fn.dataTable.Editor( {
        ajax: {
            create: {
                type: 'POST',
                url:  '/addtestcaseTable'
            },
            edit: {
                type: 'PUT',
                url:  '/editTestcase?tId=_id_'
            },
            remove: {
                type: 'DELETE',
                url:  '/deleteTestcase?tId=_id_'
            }
        },
        table: "#dtBasicExample",
        idSrc: 'testcaseId',
        fields: [  {
            label: "#",
            name: "testcaseId",
            type: "hidden"
            },
            {
                label: "Test case Name",
                name: "name"
            }, 
            {
                label: "Description:",
                name: "description"
            }, 
            {
                label: "Priority:",
                name: "priority",
                type: "select",
                options: [
                    { label: "P0", value: "P0" },
                    { label: "P1", value: "P1" },
                    { label: "P2", value: "P2" },
                    { label: "P3 ", value: "P3" }
                ]
            }, 
            {
                label: "Category:",
                name: "category"
            },
            {
                label: "Sub Category:",
                name: "subCategory"
            },
            {
                label: "Execution Steps",
                name: "executionSteps",
                type: "textarea"
            }, 
            {
                label: "Expected Result:",
                name: "expectedResult"
            },
            {
                label: "Automated",
                name: "automated"
            },
            {
                label: "Result",
                name: "result",
                type: "select",
                options: [
                    { label: "PASS", value: "PASS" },
                    { label: "FAIL", value: "FAIL" },
                    { label: "NOT RUN", value: "NOT RUN" },
                    { label: "BACKLOG ", value: "BACKLOG" }
                ]
            }

        ]
    } );
    
    // Upload Editor - triggered from the import button. Used only for uploading a file to the browser
    var uploadEditor = new $.fn.dataTable.Editor( {
        fields: [ {
            label: 'CSV file:',
            name: 'csv',
            type: 'upload',
            ajax: function ( files ) {
                // Ajax override of the upload so we can handle the file locally. Here we use Papa
                // to parse the CSV.
                Papa.parse(files[0], {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        if ( results.errors.length ) {
                            console.log( results );
                            uploadEditor.field('csv').error( 'CSV parsing error: '+ results.errors[0].message );
                        }
                        else {
                            uploadEditor.close();
                            selectColumns( editor, results.data, results.meta.fields );
                        }
                    }
                });
            }
        } ]
    } );

    $('#dtBasicExample').DataTable( {
        "scrollY": "400px",
        "scrollCollapse": true,
        dom: "Bfrtip",
        ajax: "/testcasesTable",
        columns: [
            {data: "testcaseId"},
            { data: "name" },
            { data: "description" },
            { data: "priority" },
            { data: "category" },
            { data: "subCategory" },
            { data: "executionSteps" },
            {data: "expectedResult"},
            {data:"automated"},
            {data: "result"}
        ],
        select: true,
        buttons: [
            { extend: "create", editor: editor },
            { extend: "edit",   editor: editor },
            { extend: "remove", editor: editor },
            {
                extend: 'collection',
                text: 'Export',
                buttons: [
                    'copy',
                    'excel',
                    'csv',
                    'pdf',
                    'print'
                ]
            },
            {
                text: 'Import CSV',
                action: function () {
                    uploadEditor.create( {
                        title: 'CSV file import'
                    } );
                }
            },
            {
                extend: 'selectAll',
                className: 'btn-space'
            },
            'selectNone',
        ]
    } );
} );
    