require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
// Declearing port
const port = process.env.PORT || 4000;
// Using middleware
app.use(cors());
app.use(express.json());

// Mongodb configs
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.acms3da.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Checking if it gets connected to database
client.connect(err => {
 if(err){
    console.log(err);
    console.log('Thre is a internal error');
 }
 else{
    console.log('connected to database');
 }
 
  client.close();
});

// Route for testing purpose
app.get('/',(req,res)=>{res.send('Server is running')})

// Fireng up the server
app.listen(port, ()=>{console.log(`Youe server is running on port:${port}`);})