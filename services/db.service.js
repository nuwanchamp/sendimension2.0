const { MongoClient } = require("mongodb");
const uri = "mongodb://seneview:seneview@144.24.138.30/seneview";
const mongoose = require("mongoose");


module.exports = {
    connectToServer: function (callback) {
        mongoose.connect(uri).then(function (err) {
            console.log("Successfully Connected to mongoDB");
            return callback();
        });
    },
    getDb: function () {
        return mongoose;
    }
};