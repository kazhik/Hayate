"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.StorageView = function() {
    /*
    function exists() {
        function onSuccess() {
            var filename = req.result.name;
            console.log("onSuccess: " + filename);
            
            if (filename.indexOf('/sdcard/') === 0) {
                var parts = filename.replace('/sdcard/', '').split('/');
                
                console.log("parts.length: " + parts.length);
            }
        }
        function onSuccess2() {
            var filename = req2.result.name;
            console.log("onSuccess2: " + filename);
            
            if (filename.indexOf('/sdcard/') === 0) {
                var parts = filename.replace('/sdcard/', '').split('/');
                
                console.log("parts.length: " + parts.length);
            }
        }
        function onError() {
            console.log("DeviceStorage onError: " + req.error.name);
        }
        var req = storage.get("hello");
        req.onsuccess = onSuccess;
        req.onerror = onError;
        var req2 = storage.get("PRIVATE");
        req2.onsuccess = onSuccess2;
        req2.onerror = onError;
    }
    
    function createFolder(folderName) {
        function onSuccess() {
            console.log('File "' + req.result.name + '" successfully wrote on the sdcard storage area');
        }
        function onError() {
            console.log('Unable to write the file: ' + req.error);
        }        
    	var blob = new Blob(['']);
        var req = storage.addNamed(blob, "Apps/hayate/.empty");
        req.onsuccess = onSuccess();
        req.onerror = onError();
    }
    */
    var GPX_FOLDER = "Apps/hayate/gpx";
    var files = {};
    function onPageShow() {
        function onSuccess() {
            var file = cursor.result;
            
            if (file.name.match(/\.gpx$/) !== null &&
                typeof files[file.name] === "undefined") {

                addToList(file);
            }
            
            if (!cursor.done) {
                cursor.continue();
            }
        }
        function onError() {
            if (cursor.error.name === "NotFoundError") {
                alert("No files found in " + GPX_FOLDER);
                return;
            }
            console.log("onError: " + cursor.error.name);
        }
	    files = {};
        $("#importSourceList").children().remove("li");
        
        var cursor = storage.enumerate(GPX_FOLDER);
        cursor.onsuccess = onSuccess;
        cursor.onerror = onError;
        
    }
    function addToList(f) {
        function onLoaded() {
            var $xml = $($.parseXML(reader.result));
            
            var trackName = $xml.find("trk").find("name").text();
            
            $("#importSourceList")
                .append($("<li/>")
                .append($("<a/>", {
					"href": "#",
					"data-filename": f.name,
					"text": trackName
					})))
                .listview("refresh");
            files[f.name] = f;
        }
        var reader = new FileReader();
        reader.readAsText(f);
        
        reader.onloadend = onLoaded;
        
    }
	function importTrackPoint(idx) {
		
		var gpxData = {
			latitude: parseFloat($(this).attr("lat")),
			longitude: parseFloat($(this).attr("lon")),
			elevation: parseInt($(this).find("ele").text(), 10),
			trktime: Date.parse($(this).find("time").text())
		};
		
		Hayate.Recorder.importGpx(gpxData);
	}
	function importFromFile(filename) {
        function onLoaded() {
            var $xml = $($.parseXML(reader.result));
			
			$.mobile.back();
            
            $xml.find("trkseg").children().each(importTrackPoint);
			Hayate.Recorder.finishImport();

        }
		console.log("start import");
		Hayate.Recorder.stop();
		Hayate.Recorder.clear();
		
        var reader = new FileReader();
        reader.readAsText(files[filename]);
        
        reader.onloadend = onLoaded;
		
	}
	function onSelectListItem() {
		importFromFile($(this).attr("data-filename"));
		
	
	}
    
    var publicObj = {};
	var storage;
	
	if (navigator.getDeviceStorage) {
	    storage = navigator.getDeviceStorage("sdcard");
	}
    
    publicObj.init = function() {
		if (!navigator.getDeviceStorage) {
			return;
		}
		
        $("#Import").on("pageshow", onPageShow);
		
		$("#importSourceList").on("tap", "li a", onSelectListItem);
		
    };
   
    return publicObj;
}();