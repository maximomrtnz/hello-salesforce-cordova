document.addEventListener('deviceready', onDeviceReady, false);

document.addEventListener( "touchend", function(event){
    //this function is used to prevent duplicate "tap" events
    var target = $( event.target )
    if (target.get(0).nodeName.toUpperCase() != "INPUT" && target.get(0).nodeName.toUpperCase() != "TEXTAREA") {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }
});

var sfw;
var header, container;


var templates = {
    structure:"views/structure.html",
    home:"views/home.html",
    loaded: 0,
    requested: 0,
};

function onDeviceReady( event ) {
    
    console.log("deviceready");

    //initialize salesforce wrapper
    sfw = new SalesforceWrapper();

    //load Mousetache HTML templates
    for (var key in templates) {
        (function() {
            var _key = key.toString();
            if ( _key != "loaded" && _key != "requested" ){
                templates.requested ++;
         
                 var templateLoaded = function( template ){
                    onTemplateLoaded( template, _key );
                 }
                
                $.get( templates[ _key ], templateLoaded );
             }
         })();
    }

}


function onTemplateLoaded(template, key) {
    
    console.log( key + ": " + template);
    templates[ key ] = template;
    templates.loaded ++;
    
    if ( templates.loaded == templates.requested ) {
        setupDefaultView();
    }
}

function setupDefaultView() {
    console.log("setupDefaultView");
    $("body").html( templates.structure );
    header = $("body").find("#header");
    container = $("body").find("#content");
    
    $('#login').click(function (e) {
        e.preventDefault();
        sfw.login(setupHomeView);
    });
}

function resetContainer() {
    //this removes child elements and cleans up event handlers
    container.children().remove();
    container.removeClass("nopadding");
}

function setupHomeView() {
    resetContainer();
    container.html(templates.home);
    header.html( "Home" );


    $('#sendData').click(function (e) {
        e.preventDefault();

        var data = {};

        data.Model__c = device.model;
        data.Uuid__c = device.uuid;
        data.Platform__c = device.platform;

        try {
            //Device__c is a CUSTOM OBJECT to Store Device__c information
            sfw.client.create("Device__c", data, saveDataSuccess, saveDataError );
        }catch(e){
            alert(e);
        }    

    });
}



function saveDataSuccess( result ) {
    alert("Data Saved");
}

function saveDataError( request, status, error){ 
    console.log( request.responseText ); 
    alert( request.responseText );
}