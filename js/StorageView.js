"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.StorageView = function() {

    function onFileList(gpxFiles) {
        function getTrackNameCallback(filename, trackname) {

            $("#importSourceList")
                .append($("<li/>")
                .append($("<a/>", {
                    "href": "#",
                    "data-filename": filename,
                    "text": trackname
                    })));
            $("#importSourceList").listview("refresh");
            
        }
        files = gpxFiles;
        var keys = Object.keys(gpxFiles);
        for (var i = 0; i < keys.length; i++) {
            
            Hayate.Storage.getTrackName(gpxFiles[keys[i]], getTrackNameCallback);
            
        }
    }
    function onPageShow() {
        $("#importSourceList").children().remove("li");
        Hayate.Storage.getGpxFiles(onFileList);
        
    }

	function onSelectListItem() {
		var selectedFile = files[$(this).attr("data-filename")];
		Hayate.Recorder.importGpxFile(selectedFile);
					
		$.mobile.back();
	}
    
    var publicObj = {};
    var files = {};
    
    publicObj.init = function() {
        $("#Import").on("pageshow", onPageShow);
        $("#importSourceList").on("tap", "li a", onSelectListItem);		
    };
   
    return publicObj;
}();