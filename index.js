require('dotenv').config()
var jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const privetKey = process.env.PRIVET_KEY

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
// client.connect(err=>{
//     const servicesdb = client.db('ma-consulting').collection('services');
//     if(err){
//         console.log(err);
//         app.get("/services",(req,res)=>{
//             res.send('got it from error'+ err)
//          })
        
//     }
    
//     else
//     {
//         // Our database is connected succesfully
//         console.log('connected to database');
//         // Reauest processing starts from here
//         // Routes
       
//         // Reauest processing ends from here
//     }
// })

async function run (){
    const servicesdb = client.db('ma-consulting').collection('services');
    const userCollection = client.db('ma-consulting').collection('user');
    const reviews = client.db('ma-consulting').collection('reviews');
   try{
    /*-------------------------------------------------
            Request section starts from here
      -------------------------------------------------
    */

    // Geeting request for services and sending the resources
      app.get("/services",async(req,res)=>{
        const limitation =parseInt(req.query.limit)
        
        const querry = {}
        const data = servicesdb.find(querry).limit(limitation)
        if(data){
              const servicesfound = await data.toArray()
              res.send(servicesfound)
        }
        else{
            res.send('not found')
        }
      
     })

    //  Jwt token generate
    app.post('/jwt' ,(req,res)=>{
        const email = req.body.mail;
        const token = jwt.sign(email,privetKey);
        res.send({token})

    })
    // Handling google and github sign up
    app.put('/signup',async(req,res)=>{
      const email = req.body.mail
      const querry = {mail:email};
      console.log(querry);
      const user = await userCollection.findOne(querry)
      if(!user){
        const result = await userCollection.insertOne(querry)
        res.send(result);
        console.log(querry);
      }
      else{
        res.send(user)
        console.log(user);
      }
    })

    // Handling password and gmail signup
    app.put('/signupmail',async(req,res)=>{
      const mail = req.body.email;
      const password = req.body.password;
      const user = {
        email:mail,
        password:password
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    // Getting a perticuler service details for user
    app.get('/service/details', async(req,res)=>{
      console.log(req.query.id);
      const id = req.query.id;
      const querry = {_id: ObjectId(id)}
      const result = await servicesdb.findOne(querry)
      res.send(result);

    })
    // Adding review
    app.post('/add/review',async(req,res)=>{
      
      const data = req.body
      const result = await reviews.insertOne(data)
      res.send(result)

    })

    // Loading up a specific review and sending it to the user ends
    app.get('/reviews', async(req,res)=>{
      console.log(req.query);

    })
    /*-------------------------------------------------
            Request section ends here
      -------------------------------------------------
    */
   }
   finally{

   }

}

run().catch(err=>console.log(err))


// Route for testing purpose
app.get('/',(req,res)=>{res.send('Server is running')})

// Fireng up the server
app.listen(port, ()=>{console.log(`Youe server is running on port:${port}`);})