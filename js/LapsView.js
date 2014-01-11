"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.LapsView = function() {

    function init() {
        
        $("#datetimeList").listview().listview("refresh");
        $("#laptimeList").listview().listview("refresh");
        
    }
    function addLaptime(latestTime, laptime) {
        var strTime = Hayate.Util.formatDateTime(latestTime);
        $("#datetimeList").append($("<li/>")
            .append(strTime))
            .listview("refresh");

        var strLap = Hayate.Util.formatTime(laptime);
        $("#laptimeList").append($("<li/>")
            .append(strLap))
            .listview("refresh");
        
    }    
    var publicObj = {};
    
    publicObj.init = function() {
        init();
    };
    publicObj.addLaptime = function(latestTime, laptime) {
        addLaptime(latestTime, laptime);
    }
    return publicObj;
}();