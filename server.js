'use strict';
var http = require('http');
var port = process.env.PORT || 8092;
var fs = require('fs');
const express = require("express");
const cors = require("cors");
const router = express.Router();
const db = require('./services/db.service');

var appInsights = require('applicationinsights');
if (process.env.NODE_ENV == "production") {
    appInsights.setup();
    appInsights.start();
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('./'));


app.use(require('./routes/user.route'));
app.use(require('./routes/attendance.route'));

app.get('/', function (req, res) {
    fs.readFile('index.html', function (err, data) {
        res.status(200).set({ 'Content-Type': 'text/html', 'Content-Length': data.length }).send(data);
    });
});
app.use(function (err, _req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke');
});
app.use(function (req, res, next) {
    res.status(404).send('oops! Page not found\n');
})


db.connectToServer(function (err) {
    if (err) {
        console.log(err);
        process.exit();
    }
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});