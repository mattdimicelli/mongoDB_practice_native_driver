const { MongoClient } = require('mongodb');
const assert = require('assert');
const { loadData, getData, getById } = require('./repos/circulationRepo');
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

        const byId = await getById(items[4]._id);  // this will return the item itself (not an arr)
        assert.deepEqual(byId, items[4]);
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
