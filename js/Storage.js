"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Storage = function() {
    var GPX_FOLDER = "Apps/hayate/gpx";
    function getGpxFiles(onDone) {
        function onSuccess() {
            var file = cursor.result;
            if (!file) {
                onDone(files);
                return;
            }
            
            if (file.name.match(/\.gpx$/i) !== null &&
                typeof files[file.name] === "undefined") {
                
                files[file.name] = file;

            }
            cursor.continue();
        }
        function onError() {
            console.log("DeviceStorage enumerate: " + cursor.error.name);
        }

        var cursor = storage.enumerate(GPX_FOLDER);
        cursor.onsuccess = onSuccess;
        cursor.onerror = onError;
        
    }
    function getTrackName(f, callback) {
        function onLoaded() {
            /* Too slow.
            var $xml = $($.parseXML(reader.result));
            
            var trackName = $xml.find("trk").find("name").text();
            */
            var matchResult = reader.result.match(/<trk>\n*<name>(.*)<\/name>/);
            var matchCData = matchResult[1].match(/<!\[CDATA\[(.*)\]\]>/);
            var trackName;
            if (matchCData === null) {
                trackName = matchResult[1];
            } else {
                trackName = matchCData[1];
            }
            
            callback(f.name, trackName);

        }
        var reader = new FileReader();
        reader.readAsText(f);
        
        reader.onloadend = onLoaded;
        
    }

    function fileNotFound(filename) {
        function onSuccess() {
            dfd.reject("File Found");
        }
        function onError() {
            if (request.error.name === "NotFoundError") {
                dfd.resolve();
            } else {
                dfd.reject("Failed to check if file exists: " + request.error.name);
            }
        }
        var dfd = new $.Deferred();

        var request = storage.get(filename);
        request.onsuccess = onSuccess;
        request.onerror = onError;

        return dfd.promise();

    }
    
    function writeFile(file, filename) {
        function onSuccess() {
            dfd.resolve();
        }
        function onError() {
            dfd.reject("Failed to write " + filename + ": " + request.error.name);
        }
        var dfd = new $.Deferred();
        
        var request = storage.addNamed(file, GPX_FOLDER + "/" + filename);
        request.onsuccess = onSuccess;
        request.onerror = onError;

        return dfd.promise();
    }
    
    var publicObj = {};
    var storage;
    var files = {};
    
    publicObj.init = function() {
        if (!navigator.getDeviceStorage) {
            return;
        }
        storage = navigator.getDeviceStorage("sdcard");
        
    };
    publicObj.getGpxFiles = function(onDone) {
        files = {};
        if (!navigator.getDeviceStorage) {
            onDone(files);
            return;
        }
        getGpxFiles(onDone);
    };
    publicObj.getTrackName = function(file, onDone) {
        getTrackName(file, onDone);  
    };
    publicObj.writeFile = function(filename, file) {
        return writeFile(file, filename);
    };
    publicObj.fileNotFound = function(filename) {
        return fileNotFound(filename);  
    };
    
    publicObj.checkIfAvailable = function() {
        function onSuccess() {
            if (request.result === "available") {
                dfd.resolve();
            } else {
                dfd.reject("sdcard unavailable: " + request.result);
            }
        }
        function onError() {
            dfd.reject(request.error);
        }
        var dfd = new $.Deferred();

        var request = storage.available();
        request.onsuccess = onSuccess;
        request.onerror = onError;

        return dfd.promise();
    };

   
    return publicObj;
}();