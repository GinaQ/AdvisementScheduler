<h1>README</h1>

<h2>Pre-requisites</h2>
Install MongoDB Community Edition
   - Uncheck "as a service"
   - Change install location to D: drive
   - Ok to install Mongo DB Compass
   - Add bin path to environment variables  (D:\Program Files\MongoDB\6.0\bin )

Install Mongo Shell (mongosh)
   - Change install location to D: drive
   - Add bin path to environment variables


Create a folder for MongoData to be stored.


<h2>Creating the first database</h2>

Start MongoDB: 
From command line at MongoData folder location:  mongod --port 27017 --dbpath .\MongoData

Leave this command window open. 

Start the Mongo Shell:
Start a new command window instance.
: mongosh --port 27017


Setting up Access Control
Create the User Admin:

> use admin
> db.createUser(
  {
    user: "userAdmin",
    pwd: "password", 
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  }
)

Create the DB Admin:
> use admin
> db.createUser(
  {
    user: "dbAdmin",
    pwd: "password", 
    roles: [
      { role: "dbAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" },
      { role: "clusterAdmin", db: "admin" }
    ]
  }
)

Create wspdb database and add wsp user:
use wspdb
db.createUser(
  {
    user: "wsp",
    pwd: "password",
    roles: [
      { role: "dbAdmin", db: "wspdb" },
      { role: "readWrite", db: "wspdb" }
    ]
  }
)

*Note: create your users here at this step; while in -auth, you will not be able to do so.

<h2>Restart the MongoDB with access control </h2>

Shutdown current instance: > db.adminCommand( { shutdown: 1 } )
Exit the command line: > exit

Start it again with access control (in the first command window instance): 
From command line at D:\Software Development\Dev Projects\GitKraken\WebAdvisor: mongod --auth --port 27017 --dbpath .\MongoData
Leave this window open.

From second command prompt instance:
Connect and Authenticate as the User Admin:
mongosh --port 27017  --authenticationDatabase "admin" -u "userAdmin" -p
Enter password when prompted

: use wspdb
: db.auth("wsp", "password")

<h2>Create Ehtereal Account for fake emails</h2>
https://ethereal.email/
In app.js within app.post('/emailValidation'...) replace the user: and pass: with the newly created 
ethereal email username and password. 

<h2>Run Program</h2>
I used VS Code Editor. Open terminal.

> npm install dependencies
> npm run start

Use browser to go to localhost:3000





