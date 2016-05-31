exports.collection = [];
exports.data = [];

exports.setCollection = function (collection) {
    this.collection = collection;

    return (this.collection.length > 0);
};
exports.setData = function (data) {
    this.data = data;

    return (this.data.length > 0);
};

exports.setAll = function (collection, data) {
    this.setCollection(collection);
    this.setData(data);

    return (this.collection.length > 0 && this.data.length > 0);
};


exports.insertAll = function () {
    var dbName = this.collection.config.adapter.db_name,
        tableName = this.collection.config.adapter.collection_name,
        cols = this.collection.config.columns,
        k,
        names = [],
        q = [],
        query = "INSERT INTO " + tableName,
        db;

    for (k in cols) {
        names.push(k);
        q.push("?");
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

        //Uncomment to send update event
        //this.collection.trigger('sync');
    }
};
exports.deleteAll = function () {
    var dbName = this.collection.config.adapter.db_name,
        tableName = this.collection.config.adapter.collection_name,
        idAttribute = this.collection.config.adapter.idAttribute,
        query = "DELETE FROM " + tableName,
        db;

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

    //Uncomment to send update event
    //this.collection.trigger('sync');
};
exports.updateAll = function () {
    var dbName = this.collection.config.adapter.db_name,
        tableName = this.collection.config.adapter.collection_name,
        idAttribute = this.collection.config.adapter.idAttribute,
        cols = this.collection.config.columns,
        k,
        names = [],
        q = [],
        query = "UPDATE " + tableName,
        db;

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

        //Uncomment to send update event
        //this.collection.trigger('sync');
    }
};
