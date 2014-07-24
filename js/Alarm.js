"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Alarm = function() {
    function setAlarm() {
        function onSuccess() {
            alarmId = request.result;
        }
        var alarmDate = new Date(Date.now() + (60 * 1000)); // 60 seconds later
        var request = navigator.mozAlarms.add(alarmDate, "ignoreTimezone");
        request.onsuccess = onSuccess;
    }
    function stopAlarm() {
        navigator.mozAlarms.remove(alarmId);
    }
    function startAlarm() {
        function onAlarm(mozAlarm) {
            setAlarm();
        }
        navigator.mozSetMessageHandler("alarm", onAlarm);
        setAlarm();
    }
    var alarmId = 0;
    
    var publicObj = {};
    publicObj.start = function() {
        startAlarm();
    };
    publicObj.stop = function() {
        stopAlarm();
    }

    
    return publicObj;
}();
