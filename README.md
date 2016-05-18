# batchCollection
Titanium CommonJS module to do batch DB Create/Update/Delete on Alloy Collections

Take parts and inspiration from https://gist.github.com/aaronksaunders/5066608 and http://ti-qa-archive.github.io/question/122522/can-titanium-do-a-batch-insert-into-a-database.html

#/!\ Not fully tested 
* Insert part is ok
* Delete part seems too
* *Update part not tested*


#Example
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
//We should erase only if we have datas to insert
if (myLotsOfData.length > 0) {
    magicSyncer.deleteAll();
}
//Filling
magicSyncer.insertAll();
```
Which takes over 9000 less time. At least.
