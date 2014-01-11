"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.RecordsView = function() {
    function onOpenRecords() {
        console.log("onOpenRecords");
    }

    function init() {
        $("#recordDateList").listview().listview("refresh");
        $("#recordNameList").listview().listview("refresh");

        $("#open-records").click(onOpenRecords);
        
    }
    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    
    return publicObj;
}();