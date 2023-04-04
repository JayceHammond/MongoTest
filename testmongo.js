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

// Route to access database:
app.get("/rest/ticket/:id", function (req, res) {
  const client = new MongoClient(uri);
  const searchKey = "{ Ticket ID : '" + parseInt(req.params.id) + "' }";
  console.log("Looking for: " + searchKey);

  async function run() {
    try {
      const database = client.db("CMPS415");
      const tickets = database.collection("Ticket");

      // Hardwired Query for a part that has partID '12345'
      // const query = { partID: '12345' };
      // But we will use the parameter provided with the route
      const query = { _id: parseInt(req.params.id) };

      const ticket = await tickets.findOne(query);
      console.log(ticket);
      res.send("Found this: " + JSON.stringify(ticket)); //Use stringify to print a json
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
});

app.get("/rest/list", function (req, res) {
  const client = new MongoClient(uri);
  const searchKey = "All Tickets: ";
  console.log("Looking for: " + searchKey);

  async function run() {
    try {
      const database = client.db("CMPS415");
      const tickets = database.collection("Ticket");

      const query = { _id };

      const allTickets = await tickets.find(query);
      console.log(allTickets);
      res.send("Found this: " + JSON.stringify(allTickets));
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});
