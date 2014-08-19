"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.GeopositionConverter = (function() {
    function makeGpxFileObject(positions, trackInfo) {
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
        trkElement.appendChild(createCDATAElement("name", trackInfo.name));
        trkElement.appendChild(createCDATAElement("desc", trackInfo.desc));
        trkElement.appendChild(createCDATAElement("type", trackInfo.type));
        
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
    
    function readGpxFile(file) {
        function readTrackPoint(trkpt) {
            var posJson = {
                timestamp: Date.parse(trkpt.getElementsByTagName("time")[0].childNodes[0].nodeValue),
                coords: {
                    latitude: parseFloat(trkpt.getAttribute("lat")),
                    longitude: parseFloat(trkpt.getAttribute("lon")),
                    altitude: parseInt(trkpt.getElementsByTagName("ele")[0].childNodes[0].nodeValue, 10),
                    accuracy: 1,
                    altitudeAccuracy: 1,
                    heading: null,
                    speed: null
                }
            };
            positions.push(posJson);        
        }
        function onLoaded() {
            var parser = new DOMParser();
            var doc = parser.parseFromString(reader.result, "application/xml");
            
            var trkInfo = doc.getElementsByTagName("trk")[0];

            var trkseg = trkInfo.getElementsByTagName("trkseg")[0];
        
            var trkpts = trkseg.getElementsByTagName("trkpt");
            for (var i = 0; i < trkpts.length; i++) {
                readTrackPoint(trkpts[i]);
            }
            
            var trackInfo = {
                Name: trkInfo.querySelector("name").childNodes[0].nodeValue,
                Desc: trkInfo.querySelector("desc").childNodes[0].nodeValue,
                Type: trkInfo.querySelector("type").childNodes[0].nodeValue
            };
            dfd.resolve(trackInfo, positions);
        }
        function onError() {
            dfd.reject(reader.error.name);
        }
        var dfd = new $.Deferred();

        positions.length = 0;
        var reader = new FileReader();
        reader.readAsText(file);
        
        reader.onloadend = onLoaded;
        reader.onerror = onError;

        return dfd.promise();
    }
    function clear() {
        positions.length = 0;
    }

    var positions = [];
    
    return {
        clear: clear,
        readGpxFile: readGpxFile,
        makeGpxFileObject: makeGpxFileObject
    };
}());
