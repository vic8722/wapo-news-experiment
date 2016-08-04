module.exports = function(callback) {

  var request = require('request');
  var parseString = require('xml2js').parseString;
  var sourceKeys = {
    wapo: ['title', 'link', 'category', 'description', 'pubDate']
  }

  var mongoose = require('mongoose');
  var assert = require('assert');
  var variables = require('./db.js');
  console.log('article sync: ' + variables.url);

  var db = mongoose.connect(variables.url, function (error) {
    if (error) {
      console.log(error);
    }
  });

  var Schema = mongoose.Schema;
  var ArticleSchema = new Schema({
    title : String,
    link : String,
    category : String,
    description : String,
    pubDate : String
  });


  var Article = mongoose.model('articles', ArticleSchema);

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
  {name: 'WorldViews', link: 'http://feeds.washingtonpost.com/rss/rss_blogpost'}
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


function requestAndProcessItems(feed) {
 return new Promise(function(resolve, reject) {
  request(feed.link, function (error, response, body) {
//    console.log(feed.link);
    if (!error && response.statusCode == 200) {
      var processedItems = [];
      parseString(body, function (err, result) {
       processedItems = result.rss.channel[0].item.map(processItem);
       resolve(processedItems);
     });
    } else {
      console.log('ERRR', feed.link);
      resolve([]);
    }
  });
 });
}

function saveItem(article, feed) {
 return new Promise(function(resolve, reject) {
   article.section = feed.name;
   var newArticle = Article.update(
     {link : article.link},
     {article},
     {upsert: true},
    function (err, raw) {
      resolve(feed.link);
    });
 });
}

function saveItems(processedItems, feed) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    processedItems.forEach((article) => {
      promises.push(saveItem(article, feed));
    })

    Promise.all(promises).then(() => {
      // all are done and saved...
      resolve(feed);
    })
  })
}

function triggerUpdate(feed) {

  return new Promise(function(resolve, reject) {
    requestAndProcessItems(feed).then((processedItems) => {
        console.log('processed', feed.link)
        saveItems(processedItems, feed).then((doneFeed) => {
          console.log('done saving all articles for', doneFeed.link);
          resolve(doneFeed);
        })
     });
  });
}

var allDonePromises = [];
feeds.forEach((feed) => {
  console.log('adding...', feed.link);
  allDonePromises.push(triggerUpdate(feed));
});

Promise.all(allDonePromises).then(() => {
  console.log('calling callback');
  callback();
})

console.log('end of file');
}; // end export