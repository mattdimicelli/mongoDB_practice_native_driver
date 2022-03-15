const { MongoClient, ObjectID } = require('mongodb');

function circulationRepo() {
    // will build an object via the revealing-object-pattern

    const URL = 'mongodb://localhost:27017';
    const DB_NAME = 'circulation';

    function getData(query = {}, limit) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(URL);
            try {
                await client.connect();
                const db = client.db(DB_NAME);

                let items = db.collection('newspapers').find(query);
                // items is a "cursor"... the query is not yet executed
                if (limit > 0) {
                    items = items.limit(limit);
                }
                resolve(await items.toArray()); // executes the query
                
            }
            catch(err) {
                reject(err);
            }
        })
    }

    function loadData(DATA){
        // since in App.js the call to this function is awaited, it must return a promise
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(URL);
            try {
                await client.connect();
                const db = client.db(DB_NAME);

                const results = await db.collection('newspapers').insertMany(DATA);
                resolve(results);
                client.close();
            }
            catch(err) {
                reject(err);
            }
        })
    }

    function getById(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(URL);
            try {
                await client.connect();
                const db = client.db(DB_NAME);
                id = ObjectID(id);
                const item = await db.collection('newspapers').findOne({_id: id});
                // unlike .find(), findOne() executes immediately and does not return a cursor
                resolve(item);
                client.close();
            }
            catch(err) {
                reject(err);
            }
        });
    }

    function add(item) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(URL);
            try {
                await client.connect();
                const db = client.db(DB_NAME);
                const addedItem = await db.collection('newspapers').insertOne(item);
                resolve(addedItem.ops[0]);
                client.close();
            }
            catch(err) {
                reject(err);
            }
        });
    }

    function update(id, update) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(URL);
            try {
                await client.connect();
                const db = client.db(DB_NAME);
                const updatedItem = await db.collection('newspapers')
                    .findOneAndReplace({ _id: ObjectID(id) }, update, { returnOriginal: false });
                resolve(updatedItem.value);
                client.close();
            }
            catch(err) {
                reject(err);
            }
        });
    }

    function remove(id) {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(URL);
            try {
                await client.connect();
                const db = client.db(DB_NAME);
                const removedItem = await db.collection('newspapers')
                    .deleteOne({ _id: ObjectID(id) });
                resolve(removedItem.deletedCount === 1);
                client.close();
            }
            catch(err) {
                reject(err);
            }
        });
    }

    return { loadData, getData, getById, add, update, remove }
}

module.exports = circulationRepo();