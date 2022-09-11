# AdvisementScheduler
Web Advisement Meeting Scheduler for Faculty and Students

#Pre-requisites
##Install MongoDB Community Edition
  <li>Uncheck "as a service"</li>
  <li> Change install location to D: drive</li>
  <li> Ok to install Mongo DB Compass</li>
  <li> Add bin path to environment variables  (D:\Program Files\MongoDB\6.0\bin )</li>
<br>
##Install Mongo Shell (mongosh)
   <li> Change install location to D: drive</li>
   <li> Add bin path to environment variables</li>
<br>
Create a folder for MongoData to be stored.

#Creating the first database
##Start MongoDB
From command line at MongoData folder location:  mongod --port 27017 --dbpath .\MongoData

Leave this command window open. 

#Start the Mongo Shell:
Start a new command window instance.
: mongosh --port 27017

#Setting up Access Control
##Create the User Admin

<code>
use admin
db.createUser(
  {
    user: "userAdmin",
    pwd: "password", 
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  }
)
</code>

#Create the DB Admin
<code>
use admin
db.createUser(
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
</code>

##Create wspdb database and add wsp user
<code>
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
</code>

*Note: create your users here at this step; while in -auth, you will not be able to do so.

#Restart the MongoDB with access control

Shutdown current instance: 
<code>db.adminCommand( { shutdown: 1 } ) </code>
Exit the command line: > exit

Start it again with access control (in the first command window instance): 
From command line at D:\Software Development\Dev Projects\GitKraken\WebAdvisor: mongod --auth --port 27017 --dbpath .\MongoData
Leave this window open.

From second command prompt instance:
Connect and Authenticate as the User Admin:
<code>mongosh --port 27017  --authenticationDatabase "admin" -u "userAdmin" -p</code>
Enter password when prompted
<code>
: use wspdb
: db.auth("wsp", "password")
</code>

#Create Ehtereal Account for fake emails
https://ethereal.email/
In app.js within app.post('/emailValidation'...) replace the user: and pass: with the newly created 
ethereal email username and password. 

#Run Program
I used VS Code Editor. Open terminal.
<code>
> npm install dependencies
> npm run start
</code>

Use browser to go to localhost:3000

