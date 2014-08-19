"use strict";

if (Hayate === undefined) {
    var Hayate = {};
}
Hayate.Database = (function() {
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
    function deleteDatabase(dbname) {
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
    function open(dbInfo) {
        var onSuccess = function () {
            db = request.result;
            dfd.resolve();
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onUpgradeNeeded = function (e) {
            console.log("Upgrading Database");
            var db = e.target.result;
            
            for (var i = 0; i < dbInfo.objStore.length; i++) {
                var osname = dbInfo.objStore[i].name;
                
                // Delete existing object store
                if (db.objectStoreNames.contains(osname)) {
                    db.deleteObjectStore(osname);
                }
                
                // Create a new object store
                var osOption = {};
                if (dbInfo.objStore[i].keyPath === null) {
                    osOption.autoIncrement = true;
                } else {
                    osOption.keyPath = dbInfo.objStore[i].keyPath;
                }
                var ostore = db.createObjectStore(osname, osOption);
                
                // Create indexes
                var indexes = dbInfo.objStore[i].indexes;
                if (typeof indexes === "undefined") {
                    continue;
                }
                for (var j = 0; j < indexes.length; j++) {
                    ostore.createIndex(indexes[j], indexes[j]);
                }
            }
        };
        
        var dfd = new $.Deferred();
        var request = window.indexedDB.open(dbInfo.name, dbInfo.version);
        request.onsuccess = onSuccess;
        request.onupgradeneeded = onUpgradeNeeded;
        request.onerror = onError;
        return dfd.promise();
    }
    function remove(osname, keyValue) {
        
        var onTranError = function() {
            dfd.reject(tran.error);
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onSuccess = function () {
            dfd.resolve();    
        };
        var dfd = new $.Deferred();
        
        var tran = db.transaction([osname], "readwrite");
        tran.onerror = onTranError;

        var os = tran.objectStore(osname);
        var request = os.delete(keyValue);
        
        request.onsuccess = onSuccess;
        request.onerror = onError;
        return dfd.promise();

    }
    function get(osname, keyValue) {
        var results = [];
        
        var onTranError = function() {
            dfd.reject(tran.error);
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onComplete = function() {
            dfd.resolve(request.result);
        };
        
        var dfd = new $.Deferred();
        
        var tran = db.transaction([osname], "readonly");
        tran.oncomplete = onComplete;
        tran.onerror = onTranError;

        var os = tran.objectStore(osname);
        var request = os.get(keyValue);
        
        request.onerror = onError;
        return dfd.promise();

    }
    function getItemList(osname, itemArray) {
        var resultList = [];
        
        var onTranError = function() {
            dfd.reject(tran.error);
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onSuccess = function (event) {
            var cursor = event.target.result;
            if (!cursor) {
                return;
            }
            var result = {};
            result[os.keyPath] = cursor.value[os.keyPath];

            for (var i = 0; i < itemArray.length; i++) {
                if (typeof cursor.value[itemArray[i]] === "undefined") {
                    continue;
                }
                result[itemArray[i]] = cursor.value[itemArray[i]];
            }
            resultList.push(result);
            cursor.continue();
        };
        var onComplete = function() {
            dfd.resolve(resultList);
        };

        var dfd = new $.Deferred();
        
        var tran = db.transaction([osname], "readonly");
        tran.oncomplete = onComplete;
        tran.onerror = onTranError;

        var os = tran.objectStore(osname);
        var request = os.openCursor();
        
        request.onsuccess = onSuccess;
        request.onerror = onError;
        return dfd.promise();
        
    }

    function getKeyList(osname) {
        var resultList = [];
        
        var onTranError = function() {
            dfd.reject(tran.error);
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onSuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                resultList.push(cursor.value[os.keyPath]);
                cursor.continue();
            }
        };
        var onComplete = function() {
            dfd.resolve(resultList);
        };
        var dfd = new $.Deferred();
        
        var tran = db.transaction([osname], "readonly");
        tran.oncomplete = onComplete;
        tran.onerror = onTranError;

        var os = tran.objectStore(osname);
        var request = os.openCursor();
        
        request.onsuccess = onSuccess;
        request.onerror = onError;
        return dfd.promise();
    }
    
    function executeUpdateCommand(osname, command, keyValue, itemName, itemValue) {
        var updateItemObj = {
            "add": function(currentObj) {
                currentObj[itemName].push(itemValue);
                return currentObj;
            },
            "set": function(currentObj) {
                currentObj[itemName] = itemValue;
                return currentObj;
            }
        };
        var onComplete = function() {
            dfd.resolve();    
        };
        var onTranError = function() {
            dfd.reject(tran.error);
        };
        var onError = function() {
            dfd.reject(request.error);
        };
        var onGetSuccess = function () {
            var newObj = updateItemObj[command](request.result);
            
            request = os.put(newObj);
            request.onsuccess = onPutSuccess;
        };
        var onPutSuccess = function () {
        };
        var dfd = new $.Deferred();
        
        var tran = db.transaction([osname], "readwrite");
        tran.oncomplete = onComplete;
        tran.onerror = onTranError;

        var os = tran.objectStore(osname);
        var request = os.get(keyValue);
        
        request.onsuccess = onGetSuccess;
        request.onerror = onError;
        return dfd.promise();
    }
    function add(osname, data) {
        return executeCommand(osname, "add", [data]);
    }
    function put(osname, data) {
        return executeCommand(osname, "put", [data]);
    }
    function clear(osname) {
        return executeCommand(osname, "clear");
    }
    function addItem(osname, keyValue, itemName, itemValue) {
        return executeUpdateCommand(osname, "add", keyValue, itemName, itemValue);
    }
    function setItem(osname, keyValue, itemName, itemValue) {
        return executeUpdateCommand(osname, "set", keyValue, itemName, itemValue);
    }

    var db;
    
    return {
        addItem: addItem,
        setItem: setItem,
        getKeyList: getKeyList,
        getItemList: getItemList,
        get: get,
        remove: remove,
        clear: clear,
        put: put,
        add: add,
        deleteDatabase: deleteDatabase,
        open: open
    };
}());
