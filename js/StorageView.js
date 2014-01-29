"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.StorageView = function() {
    var GPX_FOLDER = "Apps/hayate/gpx";
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
			/* Too slow.
            var $xml = $($.parseXML(reader.result));
            
            var trackName = $xml.find("trk").find("name").text();
			*/
			
			var matchResult = reader.result.match(/<trk>\n<name>(.*)<\/name>/);
			var matchCData = matchResult[1].match(/<!\[CDATA\[(.*)\]\]>/);
			var trackName;
			if (matchCData === null) {
				trackName = matchResult[1];
			} else {
				trackName = matchCData[1];
			}
           
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
	function onSelectListItem() {
		var file = files[$(this).attr("data-filename")];
		Hayate.Recorder.importGpxFile(file);
					
		$.mobile.back();
	}
    
    var publicObj = {};
	var storage;
    var files = {};
	
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