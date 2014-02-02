
asyncTest( "GeopositionConverter", 2, function() {
    function onImportComplete(positions) {
        ok(positions.length === 3, "positions.length");
        start();
    }
        var startTime = Date.now();
        var posJson = {
            timestamp: startTime,
            coords: {
                latitude: 35.692332,
                longitude: 139.815398,
                altitude: 0,
                accuracy: 100,
                altitudeAccuracy: 1,
                heading: null,
                speed: null
            }
        };
        var posJson2 = JSON.parse(JSON.stringify(posJson));
        posJson2.timestamp = startTime + (10 * 1000);
        posJson2.coords.latitude = 35.692472;
        posJson2.coords.longitude = 139.820033;
        
        var posJson3 = JSON.parse(JSON.stringify(posJson));
        posJson3.timestamp = startTime + (26 * 1000);
        posJson3.coords.latitude = 35.6851;
        posJson3.coords.longitude = 139.820741;
        
        var positions = [posJson, posJson2, posJson3];
        var trackInfo = {
            name: "track name",
            desc: "track desc",
            type: "track type"
        };
        var f = Hayate.GeopositionConverter.makeGpxFileObject(positions, trackInfo);
        ok(f !== undefined);
        
        Hayate.GeopositionConverter.importGpxFile(f, onImportComplete);
     
});


