# batchCollection
Titanium CommonJS module to do batch DB Create/Update/Delete on Alloy Collections

Take parts and inspiration from https://gist.github.com/aaronksaunders/5066608 and http://ti-qa-archive.github.io/question/122522/can-titanium-do-a-batch-insert-into-a-database.html

# /!\ Not fully tested 
* Insert part is ok
* Delete part seems too
* Update part very lightly tested

# Usage
Put the batchCollection.js in /app/lib folder.

Require it like this `var batchCollection = require('batchCollection');`

**Works only on collection with sql adapter.**

# Example
Before, you could do :
```javascript
var myGreatCollection = Alloy.createCollection('myGreatCollection'),
    myLotsOfData = []; //Part that came from ajax or whatever;
 
//Emptying
try {
    myGreatCollection.fetch({
        query: 'DELETE FROM ' + myGreatCollection.config.adapter.collection_name +
            ' WHERE id IN ("' + myLotsOfData.map(function (data) {
                return data.id;
            }).join('","') + '")'
    });
} catch (e) {
    Ti.API.debug(e);
}
//Filling
myLotsOfData.forEach(function (myData) {
    //You could do transformations to datas here
    myData.myAttribute = 'wow' + myData.id;
    
    myGreatCollection.create(myData);
    myGreatCollection.reset();
});
```
And it takes ages if you have lots of datas.

But using batchCollection instead :
```javascript
var myGreatCollection = Alloy.createCollection('myGreatCollection'),
    magicSyncer = require('batchCollection'),
    myLotsOfData = [], //Part that came from ajax or whatever
    toInsert = [];
 
magicSyncer.setCollection(myGreatCollection);
//Editing
myLotsOfData.forEach(function (myData) {
    //You could do transformations to datas here
    myData.myAttribute = 'wow' + myData.id;
    toInsert.push(myData);
});
magicSyncer.setData(toInsert);
//We should erase only if we have datas to insert or else it would empty the whole DB (by design)
if (myLotsOfData.length > 0) {
    magicSyncer.deleteAll();
}
//Filling
magicSyncer.insertAll();
```
Which takes over 9000 less time. At least.

# Methods
## Setters
`setCollection`: set the collection. Or an object who contains a collection-like structure
```javascript
//If you do this, you should have everything already setted before (db and table install)
myFakeCollection = {
    config: {
        columns: {
            'id': 'int',
            'name': 'string',
            ...
        },
        adapter: {
            db_name: '_alloy_',
            collection_name: 'myFakeTable',
            idAttribute: 'id'
        }
    }
};
```
`setData`: set the datas **array** which we'll do bulk thing to.

`setTrigger`: toggle the triggerSync var which decide if we send events.

`setDefaults`: toggle the autoDefaults var which decide if we try to use default field data if field data is null.

`setAll`: parameters -> collection, data, trigger. Call the `setCollection` and `setData`. Trigger params (**boolean**) optionnal
## Actions
`insertAll`: 
* insert all the given datas within a transaction. 
* If something fails, nothing *should be* inserted (db rollback).

`updateAll`: 
* update all the given datas within a transaction. 
* If something fails, nothing *should be* updated (db rollback). 
* *Use the idAttribute to update.*

`deleteAll`: 
* delete all the given datas within a transaction. 
* If something fails, nothing should be deleted. 
* If no data is provided, **empty** the table. *Be careful.* 
* *Use the idAttribute to delete.*

## Remarks
If no **idAttribute** is set for the collection, it try to use `alloy_id` on the `updateAll` and `deleteAll` methods. On the `inserAll`method, it ignore datas set on `alloy_id`.

If you require the lib multiple times, it keeps the setted vars from last instance. I'll maybe should do something about this.
