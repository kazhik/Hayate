"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.PopupView = function() {

    function init() {

        $("#open-about").on("tap", openAboutDialog);
    }

    function openConfirmDialog(txtTitle, txtMessage, txtButton, callback) {
        function onLoad() {

            $("#confirm-title").text(txtTitle);
            $("#confirm-message").text(txtMessage);
            $("#confirm-yes").text(txtButton);
            $("#confirm-no").text(document.webL10n.get("no"));
        
            $("#confirm-yes").on("tap", callback);

            $("#confirm-dialog").popup().popup("open");
        }
        $("#popup").load("confirm-dialog.html", onLoad);
    }
    function openAboutDialog() {
        function onLoad() {
            $("#about-dialog").popup().popup("open");
        }
        
        $("#popup").load("about-dialog.html", onLoad);
    }
    function openEditRecordDialog(recordName, callback) {
        function onLoad() {
            function ignoreEnter(e) {
                if ( e.which === 13 ) {
                    e.preventDefault();
                }
            }
            
            $("#edit-record-title").text(document.webL10n.get("edit-record-title"));
            $("#label-record-name").text(document.webL10n.get("record-name"));
            $("#cancel").text(document.webL10n.get("cancel"));
            $("#save").text(document.webL10n.get("save"));
            
            $("#record-name").textinput();
            $("#record-name").val(recordName);
        
            $("#save").on("tap", saveRecord);

            $("#edit-dialog").popup().popup("open");

            $("#record-name").keypress(ignoreEnter);
            
        }
        $("#popup").load("edit-dialog.html", onLoad);
        
    }
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    publicObj.openAboutDialog = function() {
        openAboutDialog();  
    };
    publicObj.openConfirmDialog = function(txtTitle, txtMessage, txtButton, callback) {
        openConfirmDialog(txtTitle, txtMessage, txtButton, callback);
    };
    publicObj.openEditRecordDialog = function(recordName, callback) {
        openEditRecordDialog(recordName, callback);
    };
    publicObj.toast = function(message) {
        // http://stackoverflow.com/questions/17723164/is-it-possible-to-create-an-android-style-toast-notification-using-html-css-ja
        $(".message").text(message);
        $(".message").fadeIn(500).delay(1000).fadeOut(1500);             
    };
    
    return publicObj;
}();