"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.PopupView = (function() {

    function init() {

        $("#open-about").on("tap", openAboutDialog);
    }

    function openConfirmDialog(txtTitle, txtMessage, txtButton, callback) {
        function onLoad() {

            $("#confirm-title").text(txtTitle);
            $("#confirm-message").text(txtMessage);
            $("#confirm-yes").text(txtButton);
            $("#confirm-no").text(navigator.mozL10n.get("no"));
        
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
    function toast(message) {
        function onFadeOut() {
            $("#toast").popup("destroy");
        }
        function onLoad() {
            $("#toast").text(message);
            $("#toast").popup({ positionTo: "window" }).popup("open");
            $("#toast").fadeOut(3000, onFadeOut);
        }
        console.log(message);
        $("#popup").load("toast.html", onLoad);
    }
    function openEditRecordDialog(recordName, callback) {
        function onLoad() {
            function ignoreEnter(e) {
                if ( e.which === 13 ) {
                    e.preventDefault();
                }
            }
            
            $("#edit-record-title").text(navigator.mozL10n.get("edit-record-title"));
            $("#label-record-name").text(navigator.mozL10n.get("record-name"));
            $("#cancel").text(navigator.mozL10n.get("cancel"));
            $("#save").text(navigator.mozL10n.get("save"));
            
            $("#record-name").textinput();
            $("#record-name").val(recordName);
        
            $("#save").on("tap", callback);

            $("#edit-dialog").popup().popup("open");

            $("#record-name").keypress(ignoreEnter);
            
        }
        $("#popup").load("edit-dialog.html", onLoad);
        
    }
    
    return {
        init: init,
        openAboutDialog: openAboutDialog,
        openConfirmDialog: openConfirmDialog,
        openEditRecordDialog: openEditRecordDialog,
        toast: toast
    };
}());