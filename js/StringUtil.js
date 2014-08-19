"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.StringUtil = (function() {

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
    
    return {
        formatElapsedTime: formatElapsedTime,
        formatDateTime: formatDateTime,
        formatTime: formatTime
    };
}());