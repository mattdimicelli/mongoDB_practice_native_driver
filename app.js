const { MongoClient } = require('mongodb');
const assert = require('assert');
const { loadData, getData, getById, add, update, remove } = require('./repos/circulationRepo');
const DATA = require('./circulation.json');

const URL = 'mongodb://localhost:27017';
const DB_NAME = 'circulation';

(async () => {
    const client = new MongoClient(URL);
    await client.connect();
    try {
        const { insertedCount, ops:data } = await loadData(DATA);
        // this should create a circulation database and it should be full of data
        // which is the same data that results will contain (the data returned are the MongoDB docs)
        // the circulation db is going to be just a part of a much larger repository, which will be 
        // available for use in a larger application
        assert.equal(DATA.length, insertedCount);
        const items = await getData();
        // console.log(items)
        // console.log(data);
        assert.equal(DATA.length, items.length);

        const filteredData = await getData({ Newspaper: items[4].Newspaper });
        // getData will always return an arr
        assert.deepEqual(filteredData[0], items[4]);

        const limitedData = await getData({}, 3);
        assert.equal(limitedData.length, 3);

        const id = items[4]._id.toString();
        const byId = await getById(id);  // this will return the item itself (not an arr)
        assert.deepEqual(byId, items[4]);

        const newItem = {
            "Newspaper": "El Nuevo Dia",
            "Daily Circulation, 2004": 13727,
            "Daily Circulation, 2013": 113868,
            "Change in Daily Circulation, 2004-2013": -92,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        };

        const addedItem = await add(newItem);
        assert(addedItem._id);
        const addedItemPulledById = await getById(addedItem._id);
        assert.deepEqual(addedItemPulledById, newItem);

        const updatedItem = await update(addedItem._id, {
            "Newspaper": "El Imparcial",
            "Daily Circulation, 2004": 50727,
            "Daily Circulation, 2013": 43868,
            "Change in Daily Circulation, 2004-2013": -55,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
        });
        const updatedAddedItem = await getById(addedItem._id);
        assert.equal(updatedAddedItem.Newspaper, 'El Imparcial');

        const removedItem = remove(addedItem._id);
        assert(removedItem);
        const deletedItem = await getById(addedItem._id);
        assert.equal(deletedItem, null);
    }

    catch(err) {
        console.error(err);
    }
    finally {
        const admin = client.db(DB_NAME).admin();  // an object that allows inspection of the server
        await client.db(DB_NAME).dropDatabase();
    
        // console.log(await admin.serverStatus())
        console.log(await admin.listDatabases());
    
        client.close();
    }
})();
