var sha1 = require('sha1');
var mongoose = require('mongoose');
var variables = require('../db');

var db = mongoose.connect(variables.url, function (error) {
  if (error) {
    console.log(error);
  }
});

var Schema = mongoose.Schema;
var UserArticleSchema = new Schema({
  userId : String,
  articleId : String,
  date : { type : Date, default : Date.now }
});


var UserArticle = mongoose.model('userArticle', UserArticleSchema);

// newUserArticle('579e6bfe1f89c8eb4dcc7ab9','579a53eaac600cb10a202f36');


var newUserArticle = function(userId, articleId) {
  UserArticle.count({ userId: userId, articleId: articleId }, function (err, count) {
    if (err) {
    } else if (count === 0) {
      // do something when it has NOT been  read
      var newUA = UserArticle({
        userId: userId,
        articleId: articleId,
        date: Date.now()
      });
      newUA.save(function(err) {
        if (!err) {
          db.disconnect();
        }
      });
    } else { db. disconnect() }
  });
}




module.exports = newUserArticle ;