"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Database = function() {
    var db;
    var publicObj = {};

    publicObj.deleteDatabase = function (dbname) {
        var onSuccess = function () {
            dfd.resolve();
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var dfd = new $.Deferred();
        var request = window.indexedDB.deleteDatabase(dbname);
        request.onsuccess = onSuccess;
        request.onerror = onError;
        return dfd.promise();
    }
    publicObj.open = function (dbInfo) {
        var onSuccess = function () {
            db = request.result;
            dfd.resolve();
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onUpgradeNeeded = function (e) {
            var db = e.target.result;
            
            for (var i = 0; i < dbInfo.objStore.length; i++) {
                var osname = dbInfo.objStore[i].name;
                if (db.objectStoreNames.contains(osname)) {
                    console.log("deleteObjectStore:" + osname);
                    db.deleteObjectStore(osname);
                }
                
                var osOption = {};
                if (typeof dbInfo.objStore[i].keyPath !== "undefined") {
                    osOption.keyPath = dbInfo.objStore[i].keyPath;
                } else {
                    osOption.autoIncrement = true;
                }
                console.log("createObjectStore:" + osname);
                var ostore = db.createObjectStore(osname, osOption);
                var indexes = dbInfo.objStore[i].indexes;
                for (var j = 0; j < indexes.length; j++) {
                    ostore.createIndex(indexes[j], indexes[j]);
                }
            }
        };
        var dfd = $.Deferred();
        var request = window.indexedDB.open(dbInfo.name, dbInfo.version);
        request.onsuccess = onSuccess;
        request.onupgradeneeded = onUpgradeNeeded;
        request.onerror = onError;
        return dfd.promise();

    };
    
    function executeCommand(osname, command, args) {
        var osCommand = {
            "add": function() {
                return os.add(args[0]);
            },
            "put": function() {
                return os.put(args[0]);
            },
            "clear": function() {
                return os.clear();
            }
        };

        var onTranError = function() {
            dfd.reject(tran.error);
        };
        var onComplete = function() {
            dfd.resolve();
        };
        var onError = function() {
            dfd.reject(request.error);
        };

        var dfd = new $.Deferred();
        
        var tran = db.transaction([osname], "readwrite");
        tran.oncomplete = onComplete;
        tran.onerror = onTranError;
        
        var os = tran.objectStore(osname);
        var request = osCommand[command](args);
        
        request.onerror = onError;
        return dfd.promise();
        
    }

    publicObj.add = function (osname, data) {
        return executeCommand(osname, "add", [data]);
    }

    publicObj.put = function (osname, data) {
        return executeCommand(osname, "put", [data]);
    }
    
    publicObj.clear = function (osname) {
        return executeCommand(osname, "clear");
    };

    publicObj.remove = function (osname, key, value) {
        
        var onTranError = function() {
            dfd.reject(tran.error);
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onSuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            } else {
                dfd.resolve();    
            }
        };
        var dfd = new $.Deferred();
        
        var tran = db.transaction([osname], "readwrite");
        tran.onerror = onTranError;

        var os = tran.objectStore(osname);
        var request = os.index(key)
            .openCursor(value);
        
        request.onsuccess = onSuccess;
        request.onerror = onError;
        return dfd.promise();

    };
    publicObj.get = function (osname, key, value) {
        var results = [];
        
        var onTranError = function() {
            dfd.reject(tran.error);
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onSuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            } else {
                dfd.resolve(results);    
            }
        };
        var dfd = new $.Deferred();
        
        var tran = db.transaction([osname], "readonly");
        tran.onerror = onTranError;

        var os = tran.objectStore(osname);
        var request = os.index(key)
            .openCursor(value);
        
        request.onsuccess = onSuccess;
        request.onerror = onError;
        return dfd.promise();

    };

    publicObj.getObject = function (osname, key) {
        var onTranError = function() {
            dfd.reject(tran.error);
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onSuccess = function (event) {
            dfd.resolve(request.result);    
        };
        var dfd = new $.Deferred();
        
        var tran = db.transaction([osname], "readonly");
        tran.onerror = onTranError;

        var os = tran.objectStore(osname);
        var request = os.get(key);
        
        request.onsuccess = onSuccess;
        request.onerror = onError;
        return dfd.promise();

    };
    
    return publicObj;
}();
