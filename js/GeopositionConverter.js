"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.GeopositionConverter = function() {
    function makeGpxFileObject(positions, trackName, trackDesc, trackType) {
		function createCDATAElement(name, text) {
			var element = gpxDoc.createElement(name);
			var textNode = gpxDoc.createCDATASection(text);
			element.appendChild(textNode);
			return element;
		}
		function createTextElement(name, text) {
			var element = gpxDoc.createElement(name);
			var textNode = gpxDoc.createTextNode(text);
			element.appendChild(textNode);
			return element;
		}
		
        var gpxDoc = document.implementation.createDocument(null, "gpx", null);
        
        var trkElement = gpxDoc.createElement("trk");
        trkElement.appendChild(createCDATAElement("name", trackName));
        trkElement.appendChild(createCDATAElement("desc", trackDesc));
        trkElement.appendChild(createCDATAElement("type", trackType));
        
        var trkSeg = gpxDoc.createElement("trkseg");
        for (var i = 0; i < positions.length; i++) {
            var trkPt = gpxDoc.createElement("trkpt");
            trkPt.setAttribute("lat", positions[i].coords.latitude);
            trkPt.setAttribute("lon", positions[i].coords.longitude);
            
			trkPt.appendChild(createTextElement("ele",
				positions[i].coords.altitude));
			trkPt.appendChild(createTextElement("time",
				new Date(positions[i].timestamp).toISOString()));
            
            trkSeg.appendChild(trkPt);
        }
        trkElement.appendChild(trkSeg);
        
        gpxDoc.documentElement.appendChild(trkElement);
        
        var gpxStr = new XMLSerializer().serializeToString(gpxDoc); 
        
        return new Blob([gpxStr], {type: "text/xml"});
    }
    
	function importGpxFile(file, onFinished) {
		function importTrackPoint(idx) {
			var posJson = {
				timestamp: Date.parse($(this).find("time").text()),
				coords: {
					latitude: parseFloat($(this).attr("lat")),
					longitude: parseFloat($(this).attr("lon")),
					altitude: parseInt($(this).find("ele").text(), 10),
					accuracy: 1,
					altitudeAccuracy: 1,
					heading: null,
					speed: null
				}
			};
			positions.push(posJson);		
		}
        function onLoaded() {
            var $xml = $($.parseXML(reader.result));
            
            $xml.find("trkseg").children().each(importTrackPoint);
			
			var trackInfo = {
				Name: $xml.find("trk").children("name").text(),
				Desc: $xml.find("trk").children("desc").text(),
				Type: $xml.find("trk").children("type").text()
			};
			onFinished(trackInfo, positions);
        }
		positions.length = 0;
		
        var reader = new FileReader();
        reader.readAsText(file);
        
        reader.onloadend = onLoaded;
		
	}

    var positions = [];
    var publicObj = {};
    
    publicObj.clear = function() {
		positions.length = 0;
    };
    
    publicObj.importGpxFile = function(file, onFinished) {
        importGpxFile(file, onFinished);
    };
    publicObj.makeGpxFileObject = function(positions, recInfo) {
        return makeGpxFileObject(positions, recInfo.Name, recInfo.Desc, recInfo.Type);  
    };

    return publicObj;
}();
