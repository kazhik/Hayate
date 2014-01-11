asyncTest( "Database: add, addItem, get", 2, function() {
    var dbInfo = {
        name: "Hayate",
        version: 1,
        objStore: [
            {
                name: "GeoLocation",
                keyPath: "StartTime",
                indexes: []
            }
        ]
    };
    var osname = dbInfo.objStore[0].name;
    var startTime = Date.now();
    
    var data = {
        StartTime: startTime,
        Position: [
            {
                timestamp: startTime + (0 * 1000),
            }
        ]
    };
    var newPosition1 = {
        timestamp: startTime + (1 * 1000),
    }
    var newPosition2 = {
        timestamp: startTime + (2 * 1000),
    }
    Hayate.Database.deleteDatabase(dbInfo.name)
        .then(Hayate.Database.open.bind(null, dbInfo))
        .then(Hayate.Database.add.bind(null, osname, data))
        .then(Hayate.Database.addItem.bind(null, osname, startTime, "Position", newPosition1))
        .then(Hayate.Database.addItem.bind(null, osname, startTime, "Position", newPosition2))
        .then(Hayate.Database.get.bind(null, osname, startTime))
        .done(onGet)
        .fail(onFail);
        
    function onFail(err) {
        console.log(err.name + "(" + err.message + ")" );
    }
    function onGet(result) {
        console.log(JSON.stringify(result));
        strictEqual(result["Position"].length, 3, "Position array");
        strictEqual(result["Position"][1]["timestamp"], startTime + (1 * 1000), "Position.timestamp");
        start();
    }

});

asyncTest( "Database: add, remove, getKeyList", 1, function() {
    var dbInfo = {
        name: "Hayate",
        version: 1,
        objStore: [
            {
                name: "GeoLocation",
                keyPath: "StartTime",
                indexes: []
            }
        ]
    };
    var osname = dbInfo.objStore[0].name;
    var startTime = Date.now();
    
    var data = {
        StartTime: startTime,
        Position: [
            {
                timestamp: startTime,
            }
        ]
    };
    var data2 = {
        StartTime: startTime + 1,
        Position: [
            {
                timestamp: startTime + 1,
            }
        ]
    };
    var data3 = {
        StartTime: startTime + 2,
        Position: [
            {
                timestamp: startTime + 2,
            }
        ]
    };
    Hayate.Database.open(dbInfo)
        .then(Hayate.Database.clear.bind(null, osname))
        .then(Hayate.Database.add.bind(null, osname, data))
        .then(Hayate.Database.add.bind(null, osname, data2))
        .then(Hayate.Database.add.bind(null, osname, data3))
        .then(Hayate.Database.remove.bind(null, osname, startTime + 1))
        .then(Hayate.Database.getKeyList.bind(null, osname))
        .then(onGetKeyList)
        .fail(onFail);
        
    function onFail(err) {
        console.log(err.name + "(" + err.message + ")" );
    }
    function onGetKeyList(result) {
        console.log(JSON.stringify(result));
        strictEqual(result.length, 2, "result.length");
        start();
    }

});
