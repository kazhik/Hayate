"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Storage = (function() {
    var FileInfo = {
        "gpx": {
            "folder": "Apps/hayate/gpx",
            "extension": "gpx"
        },
        "position": {
            "folder": "Apps/hayate/position",
            "extension": "position"
        }
    }
    function getFiles(type) {
        function onSuccess() {
            var file = cursor.result;
            if (cursor.done) {
                console.log("files: " + JSON.stringify(files));
                dfd.resolve(files);
            } else {
                var re = new RegExp("\." + FileInfo[type]["extension"] + "$", "i");
                if (re.test(file.name) === true &&
                    typeof files[file.name] === "undefined") {
                    
                    files[file.name] = file;
                }
                cursor.continue();
            }
        }
        function onError() {
            var msg = cursor.error.name;
            if (cursor.error.name === "TypeMismatchError") {
                msg += "(Folder doesn't exist)";
            }
            dfd.reject(msg);
        }
        
        var dfd = new $.Deferred();

        if (!navigator.getDeviceStorage) {
            dfd.reject("DeviceStorage API unavailable");
        }

        files = {};
        var cursor = storage.enumerate(FileInfo[type]["folder"]);
        cursor.onsuccess = onSuccess;
        cursor.onerror = onError;
        
        return dfd.promise();
    }
    function getTrackName(f) {
        function onLoaded() {
			var parser = new DOMParser();
			var doc = parser.parseFromString(reader.result, "application/xml");
			var trk = doc.getElementsByTagName("trk")[0];
            var strTrackName = trk.getElementsByTagName("name")[0].childNodes[0].nodeValue;
            var matchCData = strTrackName.match(/<!\[CDATA\[(.*)\]\]>/);
            if (matchCData) {
                dfd.resolve(f.name, matchCData[1]);
            } else {
                dfd.resolve(f.name, strTrackName);
            }
        }
        function onError() {
            dfd.reject(reader.error.name);
        }
        var dfd = new $.Deferred();
        
        var reader = new FileReader();
        reader.readAsText(f);
        
        reader.onloadend = onLoaded;
        reader.onerror = onError;

        return dfd.promise();
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
    
    function writeFile(file, folder, filename) {
        function onSuccess() {
            dfd.resolve();
        }
        function onError() {
            dfd.reject("Failed to write " + filename + ": " + request.error.name);
        }
        var dfd = new $.Deferred();
        
        var request = storage.addNamed(file, folder + "/" + filename);
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
    publicObj.getGpxFiles = function() {
        return getFiles("gpx");
    };
    publicObj.getTrackName = function(file) {
        return getTrackName(file);  
    };
    publicObj.writeGpxFile = function(filename, file) {
        return writeFile(file, FileInfo["gpx"]["folder"], filename);
    };
    publicObj.writePositionFile = function(filename, file) {
        return writeFile(file, FileInfo["position"]["folder"], filename);
    };
    publicObj.fileNotFound = function(filename) {
        return fileNotFound(filename);  
    };
    
    publicObj.checkIfAvailable = function() {
        function onSuccess() {
            if (request.result === "available") {
                dfd.resolve();
            } else {
                dfd.reject("Storage unavailable: " + request.result);
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
}());