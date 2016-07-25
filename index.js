var request = require('request');
var parseString = require('xml2js').parseString;
var sourceKeys = {
  wapo: ['title', 'link', 'category', 'description', 'pubDate']
}

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

request('http://feeds.washingtonpost.com/rss/rss_blogpost', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var processedItems = [];
    parseString(body, function (err, result) {
     processedItems = result.rss.channel[0].item.map(processItem);
    });
  }
  prettyLog(processedItems);
})
