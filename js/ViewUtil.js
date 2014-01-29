"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.ViewUtil = function() {

    function init() {
        $("#confirm-dialog").popup();
        $("#about-dialog").popup();

        $("#open-about").on("tap", openAboutDialog);
    }

    function openConfirmDialog(txtTitle, txtMessage, txtButton, callback) {
        
        $("#confirm-title").text(txtTitle);
        $("#confirm-message").text(txtMessage);
        $("#confirm-yes").text(txtButton);
        $("#confirm-no").text(document.webL10n.get("no"));
    
        $("#confirm-yes").on("tap", callback);

        $("#confirm-dialog").popup("open");
    }
    function openAboutDialog() {
        $("#about-dialog").popup("open");
    }
    function formatElapsedTime(msec) {
        var hour = ("0" + Math.floor(msec / (1000 * 60 * 60))).slice(-2);
        var min = ("0" + (Math.floor(msec / (1000 * 60)) - (hour * 60))).slice(-2);
        var sec = ("0" + Math.floor((msec % (1000 * 60)) / 1000)).slice(-2);
        
        return hour + ":" + min + ":" + sec; 
    }
    function formatDateTime(msec) {
        var datetime = new Date(msec);
        return datetime.toLocaleString(); 
    }
    function formatTime(msec) {
        var datetime = new Date(msec);
        return datetime.toLocaleTimeString(); 
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
    publicObj.formatElapsedTime = function(msec) {
        return formatElapsedTime(msec);
    };
    publicObj.formatDateTime = function(msec) {
        return formatDateTime(msec);
    };
    publicObj.formatTime = function(msec) {
        return formatTime(msec);
    };
    
    
    return publicObj;
}();