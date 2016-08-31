exports.collection = [];
exports.data = [];
exports.triggerSync = false;
exports.autoDefaults = true;

exports.setCollection = function (collection) {
    this.collection = collection;

    return (this.collection.length > 0);
};
exports.setData = function (data) {
    this.data = data;

    return (this.data.length > 0);
};
exports.setTrigger = function (data) {
    if (this.triggerSync) {
        this.triggerSync = false;
    } else {
        this.triggerSync = true;
    }

    return this.triggerSync;
};
exports.setDefaults = function () {
    if (this.autoDefaults) {
        this.autoDefaults = false;
    } else {
        this.autoDefaults = true;
    }

    return (this.autoDefaults);
};

exports.setAll = function (collection, data, trigger) {
    this.setCollection(collection);
    this.setData(data);
    if (typeof (trigger) !== 'undefined') {
        this.triggerSync = trigger;
    }

    return (this.collection.length > 0 && this.data.length > 0);
};


exports.insertAll = function () {
    var dbName = this.collection.config.adapter.db_name,
        tableName = this.collection.config.adapter.collection_name,
        cols = this.collection.config.columns,
        defaults = {},
        k,
        names = [],
        q = [],
        query = "INSERT INTO " + tableName,
        db;
    
    if (this.autoDefaults) {
        if (typeof (this.collection.config.defaults) !== 'undefined') {
            defaults = this.collection.config.defaults;
        }
    }
    for (k in cols) {
        if (k !== 'alloy_id') {
            names.push(k);
            q.push("?");
        }
    }
    query = query + " (" + names.join(',') + ")";
    query = query + " VALUES (" + q.join(',') + ");";
    if (this.data.length > 0) {
        db = Ti.Database.open(dbName);
        db.execute('BEGIN IMMEDIATE TRANSACTION;');

        try {
            this.data.forEach(function (dat) {
                var rawData = [];
                names.forEach(function (key) {
                    if (dat[key] === null) {
                        if (typeof (defaults[key]) !== 'undefined') {
                            dat[key] = defaults[key];
                        }
                    }
                    rawData.push(dat[key]);
                });
                db.execute(query, rawData);
            });

            db.execute('COMMIT TRANSACTION;');
        } catch (except) {
            Ti.API.error(except);
            db.execute('ROLLBACK TRANSACTION;');
        }

        db.close();

        //Send update event to collection ?
        if (this.triggerSync) {
            this.collection.trigger('sync');
        }
    }
};
exports.deleteAll = function () {
    var dbName = this.collection.config.adapter.db_name,
        tableName = this.collection.config.adapter.collection_name,
        idAttribute = this.collection.config.adapter.idAttribute,
        query = "DELETE FROM " + tableName,
        db;
    
    if (typeof (idAttribute) === 'undefined') {
        idAttribute = 'alloy_id';
    }

    db = Ti.Database.open(dbName);
    db.execute('BEGIN IMMEDIATE TRANSACTION;');

    if (this.data.length > 0) {
        query = query + " WHERE " + idAttribute +
            ' IN ("' + this.data.map(function (dat) {
                return dat[idAttribute];
            }).join('","') + '")';
    }
    try {
        db.execute(query);
        db.execute('COMMIT TRANSACTION;');
    } catch (except) {
        Ti.API.error(except);
        db.execute('ROLLBACK TRANSACTION;');
    }

    db.close();

    //Send update event to collection ?
    if (this.triggerSync) {
        this.collection.trigger('sync');
    }
};
exports.updateAll = function () {
    var dbName = this.collection.config.adapter.db_name,
        tableName = this.collection.config.adapter.collection_name,
        idAttribute = this.collection.config.adapter.idAttribute,
        cols = this.collection.config.columns,
        defaults = {},
        k,
        names = [],
        q = [],
        query = "UPDATE " + tableName,
        db;

    if (typeof (idAttribute) === 'undefined') {
        idAttribute = 'alloy_id';
    }
    
    if (this.autoDefaults) {
        if (typeof (this.collection.config.defaults) !== 'undefined') {
            defaults = this.collection.config.defaults;
        }
    }
    for (k in cols) {
        if (k !== idAttribute) {
            names.push(k);
        }
    }
    query = query + " SET " + names.join(' = ?,');
    query = query.substr(0, (query.length - 1));
    query = query + " WHERE " + idAttribute + " = ?";
    if (this.data.length > 0) {
        db = Ti.Database.open(dbName);
        db.execute('BEGIN IMMEDIATE TRANSACTION;');

        try {
            this.data.forEach(function (dat) {
                var rawData = [];
                names.forEach(function (key) {
                    if (dat[key] === null) {
                        if (typeof (defaults[key]) !== 'undefined') {
                            dat[key] = defaults[key];
                        }
                    }
                    rawData.push(dat[key]);
                });
                rawData.push(dat[idAttribute]);
                db.execute(query, rawData);
            });
            db.execute('COMMIT TRANSACTION;');
        } catch (except) {
            Ti.API.error(except);
            db.execute('ROLLBACK TRANSACTION;');
        }

        db.close();

        //Send update event to collection ?
        if (this.triggerSync) {
            this.collection.trigger('sync');
        }
    }
};
