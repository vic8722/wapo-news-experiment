# TODO

## Refactor
* db.js - make connection define mongo URL once
* models/ directory
* models/articles.js export the mongoose Article object
* same as above but for users.js

## Users
* create `users` collection/ mongoose schema
* create /register endpoint on express should save first, last name, email, and hashed password: https://github.com/ncb000gt/node.bcrypt.js
* make /register POST work via 'Paws'
* make /register FE form and connect on backend...
* make authentication work: https://github.com/izaakschroeder/express-authentication

## After Users Work
* add /track?url= endpoint which tracks the links they followed
* tons of other awesome stuff!!!
------

db.js

