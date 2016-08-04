var articleSync = require('./article-sync.js');

articleSync(() => console.log('DONE!'));
// var Agenda = require('./node_modules/agenda/lib/agenda.js');

// var variables = require('./db.js');
//   console.log('scheduled update: ' + variables.url);


// var agenda = new Agenda({db: {address: variables.url, collection: 'agenda-jobs' }});

// agenda.define('update articles', function(job, done) {
//   articleSync(done);
// });

// agenda.on('ready', function() {
//   agenda.every('4 hours', 'update articles');

//   agenda.start();
// });