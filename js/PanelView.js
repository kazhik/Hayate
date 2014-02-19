"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.PanelView = function() {
    function init() {
        $("#LeftPanel").panel();
        $("#panel-menu").listview().listview("refresh");

        if (Hayate.Config.get(["debug","log"]) === "on") {
            $("#panel-menu")
                .append($("<li/>")
                .append($("<a/>", {
                    "href": "#Log",
                    "id": "open-log",
                    "text": document.webL10n.get("log")
                    })))
                .listview("refresh");
        }
        

    }
    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    
    return publicObj;
}();