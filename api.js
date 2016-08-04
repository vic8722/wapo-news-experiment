var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors');
var variables = require('db');

// mongod --dbpath=/data --port 27017

mongoose.connect(variables.url, function (error) {
  if (error) {
    console.log(error);
  }
});

// Mongoose Schema definition
var Schema = mongoose.Schema;
  var ArticleSchema = new Schema({
  title : String ,
  link : String ,
  category : [String] ,
  description : String ,
  pubDate : String  ,
  section : String
});

var Article = mongoose.model('articles', ArticleSchema);

var app = express();
app.use(cors());

app.get('/', function (req, res) {
  res.send("<div><a href='/articles'>Show Articles</a></div><div><a href='/articles/sections'>Show Sections</a></div>")
})

app.get('/articles', function (req, res) {
    Article.find({}, function (err, docs) {
        res.json(docs);
    });
});

app.get('/articles/sections', function (req, res) {
    Article.distinct( "section" , function (err, docs) {
      docs = docs.sort();
      var sections = [];
      docs.forEach( (section) => {
        sections.push({section: section , link : "http://localhost:3002/articles/sections/" + section });
      });
      res.json(sections);
    })
});

app.get('/articles/sections/:section', function (req, res) {
    if (req.params.section) {
        Article.find({ section: req.params.section }, function (err, docs) {
            res.json(docs);
        });
    }
});

// Start the server
app.listen(3002);
