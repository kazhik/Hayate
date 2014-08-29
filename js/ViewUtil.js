"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.ViewUtil = (function() {
    function getRealContentHeight() {
        var header = $.mobile.activePage.find("div[data-role='header']:visible");
        var headerFooterHeight = 0;
        if (header.length > 0) {
            headerFooterHeight += header.outerHeight();
        }

        var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
        if (footer !== null && footer.length > 0) {
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
        if (footer !== null && footer.length > 0) {
            headerFooterHeight += footer.outerHeight()
        }

        var viewportHeight = $(window).height();
        var contentHeight = viewportHeight - headerFooterHeight;
        
        return contentHeight;
    }
    
    return {
        getRealContentHeight: getRealContentHeight,
        getContentHeight: getContentHeight
    };
}());