var request = require('request');
var parseString = require('xml2js').parseString;
var sourceKeys = {
  wapo: ['title', 'link', 'category', 'description', 'pubDate']
}
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var url = 'mongodb://localhost:27017/wapo-news-experiment';
var feeds = [
{name: 'Achenblog', link: 'http://feeds.washingtonpost.com/rss/rss_achenblog'},
{name: 'Arts &amp; Entertainment', link: 'http://feeds.washingtonpost.com/rss/rss_arts-post'},
{name: 'Blogs and Columns', link: 'http://feeds.washingtonpost.com/rss/sports/blogs-columns'},
{name: 'Business', link: 'http://feeds.washingtonpost.com/rss/business'},
{name: 'Checkpoint', link: 'http://feeds.washingtonpost.com/rss/rss_checkpoint'},
{name: 'Comic Riffs', link: 'http://feeds.washingtonpost.com/rss/rss_comic-riffs'},
{name: 'Digger', link: 'http://feeds.washingtonpost.com/rss/rss_digger'},
{name: 'Energy and Environment', link: 'http://feeds.washingtonpost.com/rss/national/energy-environment'},
{name: 'Going Out Guide', link: 'http://feeds.washingtonpost.com/rss/rss_going-out-gurus'},
{name: 'Innovations', link: 'http://feeds.washingtonpost.com/rss/rss_innovations'},
{name: 'Lifestyle', link: 'http://feeds.washingtonpost.com/rss/lifestyle'},
{name: 'Monkey Cage', link: 'http://feeds.washingtonpost.com/rss/rss_monkey-cage'},
{name: 'Morning Mix', link: 'http://feeds.washingtonpost.com/rss/rss_morning-mix'},
{name: 'National', link: 'http://feeds.washingtonpost.com/rss/national'},
{name: 'On Leadership', link: 'http://feeds.washingtonpost.com/rss/rss_on-leadership'},
{name: 'Opinions', link: 'http://feeds.washingtonpost.com/rss/opinions'},
{name: 'Post Nation', link: 'http://feeds.washingtonpost.com/rss/rss_post-nation'},
{name: 'Post Politics', link: 'http://feeds.washingtonpost.com/rss/rss_election-2012'},
{name: 'Solo-ish', link: 'http://feeds.washingtonpost.com/rss/rss_soloish'},
{name: 'Speaking of Science', link: 'http://feeds.washingtonpost.com/rss/rss_speaking-of-science'},
{name: 'Sports', link: 'http://feeds.washingtonpost.com/rss/sports'},
{name: 'The Fact Checker', link: 'http://feeds.washingtonpost.com/rss/rss_fact-checker'},
{name: 'The Fix', link: 'http://feeds.washingtonpost.com/rss/rss_the-fix'},
{name: 'The Intersect', link: 'http://feeds.washingtonpost.com/rss/rss_the-intersect'},
{name: 'The Reliable Source', link: 'http://feeds.washingtonpost.com/rss/rss_reliable-source'},
{name: 'The Switch', link: 'http://feeds.washingtonpost.com/rss/blogs/rss_the-switch'},
{name: 'To Your Health', link: 'http://feeds.washingtonpost.com/rss/rss_to-your-health'},
{name: 'Wonkblog', link: 'http://feeds.washingtonpost.com/rss/rss_wonkblog'},
{name: 'World', link: 'http://feeds.washingtonpost.com/rss/world'},
{name: 'WorldViews', link: 'http://feeds.washingtonpost.com/rss/rss_blogpost'},
];



function prettyLog(obj) {
 console.log(JSON.stringify(obj, null, indent=2));
}

function processItem(item) {
  var keysToKeep = sourceKeys.wapo;
  var keys = Object.keys(item);
  var result = {};
  keys.forEach((key) => {
    if (keysToKeep.indexOf(key) !== -1) {
      result[key] = item[key].length === 1 ? item[key][0] : item[key];
    }
  });

  return result;
}

feeds.forEach( (feed) => {
  request(feed.link, function (error, response, body) {
    console.log(feed.link);
    if (!error && response.statusCode == 200) {
      var processedItems = [];
      parseString(body, function (err, result) {
       processedItems = result.rss.channel[0].item.map(processItem);
      });
    }
    // prettyLog(processedItems);
      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        processedItems.forEach((article) => {
          var title = article.title;
          var link = article.link;
          var category = article.category;
          var description = article.description;
          var pubDate = article.pubDate;
          var section = feed.name;
          var collection = db.collection('articles');

          collection.update(
            { link : link },
            { $set: { title : title ,
                      link : link ,
                      category : category ,
                      description : description ,
                      pubDate : pubDate  ,
                      section : section } },
            {
               upsert: true
             }
          );


        })
        db.close();
      });
  })
})



// var addArticle = function(db, callback) {
//   db.collection.update(
//     <query>,
//     <update>,
//     {
//       upsert: <boolean>,
//       multi: <boolean>,
//       writeConcern: <document>
//     }
//   )

// }





// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   console.log("Connected correctly to server");
//   db.dropDatabase();


//   // insertDocuments(db, function() {
//   //   updateDocument(db, function() {
//   //     deleteDocument(db, function() {
//   //       findDocuments(db, function() {
//   //         db.close();
//   //       });
//   //     });
//   //   });
//   // });

// });


// var insertDocuments = function(db, callback) {
//   // Get the documents collection
//   var collection = db.collection('documents');
//   // Insert some documents
//   collection.insertMany([
//     {a : 1}, {a : 2}, {a : 3}
//   ], function(err, result) {
//     assert.equal(null, err);
//     assert.equal(3, result.result.n);
//     assert.equal(3, result.ops.length);
//     console.log("Inserted 3 documents into the document collection");
//     callback(result);
//   });
// }

// var updateDocument = function(db, callback) {
//   // Get the documents collection
//   var collection = db.collection('documents');
//   // Update document where a is 2, set b equal to 1
//   collection.updateOne({ a : 2 }
//     , { $set: { b : 1 } }, function(err, result) {
//     assert.equal(err, null);
//     assert.equal(1, result.result.n);
//     console.log("Updated the document with the field a equal to 2");
//     callback(result);
//   });
// }

// var deleteDocument = function(db, callback) {
//   // Get the documents collection
//   var collection = db.collection('documents');
//   // Insert some documents
//   collection.deleteOne({ a : 3 }, function(err, result) {
//     assert.equal(err, null);
//     assert.equal(1, result.result.n);
//     console.log("Removed the document with the field a equal to 3");
//     callback(result);
//   });
// }

// var findDocuments = function(db, callback) {
//   // Get the documents collection
//   var collection = db.collection('documents');
//   // Find some documents
//   collection.find({}).toArray(function(err, docs) {
//     assert.equal(err, null);
//     assert.equal(2, docs.length);
//     console.log("Found the following records");
//     console.dir(docs);
//     callback(docs);
//   });
// }