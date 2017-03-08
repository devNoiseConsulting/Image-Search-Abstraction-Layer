let mongo = require('mongodb').MongoClient;
let db = require('./db');
let http = require("https");
let express = require('express');

let app = express();
let dbUrl = "mongodb://" + process.env.DBUSER + ":" + process.env.DBPASSWORD + "@" + process.env.DBURL;

app.set('port', (process.env.PORT || 8080));

app.get(/^\/api\/imagesearch\/.*/, function(req, res) {
    let searchQuery = req.originalUrl.replace(/^\/api\/imagesearch\/([^?]*)(\?.*)?/, "$1");
    let searchURL = mkSearchURL(searchQuery, req.query.offset);
    console.log(searchURL);
    let output = {
        "stub": "do more stuff",
        "query": searchQuery,
        "offset": req.query.offset
    };
    http.get(searchURL, function(httpResponse) {
        var data = "";
        httpResponse.on("data", function(chunk) {
            // Save the chunked data (as a string) to the data variable.
            data += chunk.toString();
        });
        httpResponse.on("end", function() {
            // Convert the data string to a JSON object and pass it to the
            // specified callback function.
            let results = JSON.parse(data);
            output = results.items.map(function(item) {
                let image = {
                    "url": item.link,
                    "snippet": item.snippet,
                    "thumbnail": item.image.thumbnailLink,
                    "context": item.image.contextLink
                };
                return image;
            });
            output.dnTimeStamp = new Date();
            saveSearch();
            // console.log(uri);
        });
    });

    function saveSearch() {
        var collection = db.get().collection('imagesearch');
        let document = {
            "term": searchQuery,
            "when": new Date()
        };
        try {
            collection.insert(document);
            res.end(JSON.stringify(output, null, 2));
        } catch (e) {
            res.end(JSON.stringify(output, null, 2));
        }
    }
});

app.get('/api/latest/imagesearch/', function(req, res) {
    let output = {
        "stub": "do more stuff"
    };
    var collection = db.get().collection('imagesearch');
    collection.find({
        $query: {},
        $orderby: {
            _id: -1
        }
    }).limit(10).toArray(function(err, docs) {
        output = {
            "error": "Something went wrong with the database."
        };
        if (err) {
            res.end(JSON.stringify(output, null, 2));
        }
        output = docs.map(function(doc) {
          return {
            "term": doc.term,
            "when": doc.when
          };
        });
        res.end(JSON.stringify(output, null, 2));
    });
});

app.get('/', function(req, res) {
    let output = {
        "app": "Image Search Abstraction Layer",
        "paths": {
            "/api/imagesearch/<query>": "Image search.",
            "/api/latest/imagesearch/": "List of recent searches."
        }
    };

    res.end(JSON.stringify(output, null, 2));
});


db.connect(dbUrl, function(err) {
    if (err) {
        console.log('Unable to connect to Mongo.');
        process.exit(1);
    } else {
        app.listen(app.get('port'), function() {
            console.log('Image Search Abstraction Layer is listening on port ', app.get('port'));
            //console.log(dbUrl);
        });
    }
});


function mkSearchURL(query, offset = 1) {
    var url = "https://www.googleapis.com/customsearch/v1?key=" +
        process.env.CSE_API_KEY + "&cx=" + process.env.CSE_ID + "&searchType=image&q=" + query + "&start=" + offset;
    return url;
}
