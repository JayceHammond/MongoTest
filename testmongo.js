const { MongoClient } = require("mongodb");

// The uri string must be the connection string for the database (obtained on Atlas).
const uri =
  "mongodb+srv://JayceDB:yhlnSd5eupLkZ55N@cmps415.rfhvwh1.mongodb.net/?retryWrites=true&w=majority";

// --- This is the standard stuff to get it to work on the browser
const express = require("express");
const app = express();
const port = 3000;

app.listen(port);
console.log("Server started at http://localhost:" + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

// Default route:
app.get("/", function (req, res) {
  const myquery = req.query;
  var outstring = "Starting... ";
  res.send(outstring);
});

app.get("/say/:name", function (req, res) {
  res.send("Hello " + req.params.name + "!");
});

// Get Ticket by Id
app.get("/rest/ticket/:id", function (req, res) {
  const client = new MongoClient(uri);

  const searchKey = "{ Ticket ID : '" + parseInt(req.params.id) + "' }";
  console.log("Looking for: " + searchKey);

  async function run() {
    try {
      const database = client.db("CMPS415");
      const tickets = database.collection("Ticket");
      const searchId = req.params.id;

      if(searchId < 1){
        return res.send("Invalid ID");
      }
      const query = { _id: parseInt(searchId) };
      const ticket = await tickets.findOne(query);
      if(ticket == null){
        return res.send("Ticket not found");
      }
      console.log(ticket);
      res.send("Found this: " + JSON.stringify(ticket)); //Use stringify to print a json
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
});

//Get All Tickets
app.get("/rest/list", function (req, res) {
  console.log("Looking for: All Tickets");
  const client = new MongoClient(uri);


  async function run() {
    try {
      const database = client.db("CMPS415");
      const ticket = database.collection("Ticket");
      let results = await ticket.find({}).limit(50).toArray()
      res.send(JSON.stringify(results)).status(200);
    } finally {
      await client.close();
      console.log("No Tickets Found");
    }
  }
  run().catch(console.dir);
});

app.post("/rest/ticket/", function (req, res){
  console.log("Posting Ticket: ");
  const client = new MongoClient(uri);


  async function run(){
    try{
      const database = client.db("CMPS415");
      const ticket = database.collection("Ticket");
      //let newId = await ticket.find().sort( { _id : -1 } ).limit(1).toArray();
      var newTicket = {
        createdAt: req.body.createdAt,
        updatedAt: req.body.updatedAt,
        type: req.body.type,
        subject: req.body.subject,
        Description: req.body.Description,
        priority: req.body.priority,
        status: req.body.status,
        recipient: req.body.recipient,
        submitter: req.body.submitter,
        assignee_ID: req.body.assignee_ID,
        follower_IDs: req.body.follower_IDs,
        tags: req.body.tags
      }

      if (newTicket.createdAt == null || newTicket.updatedAt == null || newTicket.type == null || newTicket.subject == null || 
        newTicket.Description == null || newTicket.priority == null || newTicket.status == null || newTicket.recipient == null || 
        newTicket.submitter == null || newTicket.assignee_ID == null || newTicket.follower_IDs == null ||
        newTicket.tags == null) {
        return res.send("Content cannot be null");
    }

    //Can't input a time stamp but the Phase I doc requires it be a postable field. Therefore check if the time stamp is at least an integer
    if(typeof(newTicket.createdAt) != 'number' || typeof(newTicket.updatedAt) != 'number' || typeof(newTicket.assignee_ID) != 'number'|| 
    typeof(newTicket.follower_IDs) != 'object'){
      return res.send("Id, create time, and update time must be integers. Follower Ids must be an array.");
    }

    if(typeof(newTicket.type) != 'string' || typeof(newTicket.subject) != 'string' || typeof(newTicket.Description) != 'string' || typeof(newTicket.priority) != 'string' ||
    typeof(newTicket.status) != 'string' || typeof(newTicket.recipient) != 'string' || typeof(newTicket.submitter) != 'string' || typeof(newTicket.tags) != 'object'){
      return res.send("Type, subject, description, priority level, status, recipient, and submitter must be strings. Tags must be an array.")
    }


      await ticket.insertOne(newTicket);
      let result = newTicket;
      res.send(JSON.stringify(result)).status(204);
    }finally{
      await client.close();
    }
  }
  run().catch(console.dir);
});
