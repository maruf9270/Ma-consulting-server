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



// Connecting to the databse and processing all the request
client.connect(err=>{
    const services = client.db('ma-consulting').collection('services');
    if(err){
        console.log(err);
    }
    
    else
    {
        // Our database is connected succesfully
        console.log('connected to database');
        // Reauest processing starts from here
        // Routes
        app.get('/services',async(req,res)=>{
            const querry = {}
            const data = services.find(querry)
            const servicesfound = await data.toArray()
            res.status(200).send(servicesfound)
        })
        // Reauest processing ends from here
    }
})

// Route for testing purpose
app.get('/',(req,res)=>{res.send('Server is running')})

// Fireng up the server
app.listen(port, ()=>{console.log(`Youe server is running on port:${port}`);})