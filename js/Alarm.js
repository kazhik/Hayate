"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Alarm = (function() {
    function setAlarm() {
        function onAlarmAdded() {
            alarmId = request.result;
        }
        var alarmDate = new Date(Date.now() + (60 * 1000)); // 60 seconds later
        var request = navigator.mozAlarms.add(alarmDate, "ignoreTimezone");
        request.onsuccess = onAlarmAdded;
    }
    function setHandler() {
        function onAlarm(mozAlarm) {
            // set next alarm
            setAlarm();
        }
        navigator.mozSetMessageHandler("alarm", onAlarm);
    }
    function startAlarm() {
        setHandler();
        setAlarm();
    }
    function stopAlarm() {
        navigator.mozAlarms.remove(alarmId);
    }
    var alarmId = 0;
    
    return {
        start: startAlarm,
        stop: stopAlarm
    };
}());
