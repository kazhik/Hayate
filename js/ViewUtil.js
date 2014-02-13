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
    function getRealContentHeight() {
        var header = $.mobile.activePage.find("div[data-role='header']:visible");
        var headerFooterHeight = 0;
        if (header.length > 0) {
            headerFooterHeight += header.outerHeight();
        }

        var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
        if (footer.length > 0) {
            headerFooterHeight += footer.outerHeight()
        }

        var viewportHeight = $(window).height();
        var contentHeight = viewportHeight - headerFooterHeight;
        
        var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
        if((content.outerHeight() - headerFooterHeight) <= viewportHeight) {
            contentHeight -= (content.outerHeight() - content.height());
        } 
        return contentHeight;
    }
    function getContentHeight() {
        var header = $.mobile.activePage.find("div[data-role='header']:visible");
        var headerFooterHeight = 0;
        if (header.length > 0) {
            headerFooterHeight += header.outerHeight();
        }

        var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
        if (footer.length > 0) {
            headerFooterHeight += footer.outerHeight()
        }

        var viewportHeight = $(window).height();
        var contentHeight = viewportHeight - headerFooterHeight;
        
        return contentHeight;
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
    publicObj.toast = function(message) {
        // http://stackoverflow.com/questions/17723164/is-it-possible-to-create-an-android-style-toast-notification-using-html-css-ja
        $(".message").text(message);
        $(".message").fadeIn(500).delay(1000).fadeOut(1500);             
    };
    publicObj.getRealContentHeight = function() {
        return getRealContentHeight();    
    };
    publicObj.getContentHeight = function() {
        return getContentHeight();    
    };
    
    return publicObj;
}();