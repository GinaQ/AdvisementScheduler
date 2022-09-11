const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const database = 'mongodb://wsp:password@localhost:27017/wspdb?authSource=wspdb';
//const database = 'mongodb:localhost:27017';
//const databaseoptions = {useMongoClient: true, poolSize: 10};
const databaseoptions = {poolSize: 20};

mongoose.connect(database, databaseoptions);

// close connection when app terminates
process.on('SIGINT', () => {
    mongoose.connection.close( () => {
        console.log('Mongoose connection closed dut to app termination');
        process.exit(0);
    })
});