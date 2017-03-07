/*
var mongo = require('mongodb').MongoClient;
var db = require('./db');
*/
var express = require('express');

var app = express();
let dbUrl = "mongodb://" + process.env.DBUSER + ":" + process.env.DBPASSWORD + "@" + process.env.DBURL;

app.set('port', (process.env.PORT || 8080));

app.get(/^\/api\/imagesearch\/.*/, function(req, res) {
    var output = {
        "stub": "do more stuff"
    };

    res.end(JSON.stringify(output, null, 2));
});

app.get('/api/latest/imagesearch/', function(req, res) {
  var output = {
      "stub": "do more stuff"
  };

  res.end(JSON.stringify(output, null, 2));
});

app.get('/', function(req, res) {
    var output = {
        "app": "Image Search Abstraction Layer",
        "paths": {
            "/api/imagesearch/<query>": "Image search.",
            "/api/latest/imagesearch/": "List of recent searches."
        }
    };
    res.end(JSON.stringify(output, null, 2));
});

/*
db.connect(dbUrl, function(err) {
    if (err) {
        console.log('Unable to connect to Mongo.');
        process.exit(1);
    } else {
*/
        app.listen(app.get('port'), function() {
            console.log('URL Shortener microservice is listening on port ', app.get('port'));
            //console.log(dbUrl);
        });
/*
    }
});
*/
