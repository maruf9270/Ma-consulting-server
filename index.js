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
      const img = req.body.img;
      const name = req.body.name
      const user = {
        email:mail,
        password:password,
        name: name,
        img: img
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
      const id = req.query.sid
      const querry = {serviceid: id}
      const result = reviews.find(querry).sort({time:-1})
      const found = await result.toArray()
      console.log(found);
      res.send(found)
    })
    // middleware for auth token varify
    function check (req,res,next){
      
      const token = req.headers.token
     
      if(!token){
        
        return  res.status(400).send({message:"Unauthoraised access"})
      }

      jwt.verify(token,privetKey,function(err,decoded){
        if(err){
         
         return  res.status(400).send({message:"Unauthoraised access"})
        
        }
        
        req.decoded = decoded
        next()
       
      })

     


    }

    // Geeting request for my review and sending it back to the user
    app.get('/myreviews',check,async(req,res)=>{
      const details = req.decoded
      const detailsLowerCased = details.toLowerCase()
      const mail = req.query.mail
      const mailLowercased = mail.toLowerCase()
      if(detailsLowerCased !== mailLowercased){
        return res.status(400).send({message:"Unauthoraised access"})
      }
      else{
        const querry = {email: mail}
        const result = reviews.find(querry).sort({time:1});
        const data = await result.toArray();
        res.send(data)
      }
      
    })

    // Handling delete request
    app.delete('/delete', async(req,res)=>{
      const id = req.query.id;
      const querry = {_id: ObjectId(id)}
      const result = await reviews.deleteOne(querry)
      res.send(result)
      console.log(id);
    })


    // For updating user review
    app.put('/update', async(req,res)=>{
      const id = req.query.id
      const updated = req.body
      
      const filter = {_id: ObjectId(id)}
      const options = { upsert: true };
      const updateReview = {
        $set: updated
      }
      const result = await reviews.updateOne(filter,updateReview,options)
      res.send(result)
    })

    // Loading a sigle review 
    app.get('/editreview',async(req,res)=>{
      const id = req.query.id;
      const querry = {_id: ObjectId(id)}
      const result = await reviews.findOne(querry)
      res.send(result)
      console.log(id);
    })
    // Getting estimated document and sending it to the user
    app.get('/total', async(req,res)=>{
      const total = await servicesdb.estimatedDocumentCount()
      res.send({total})
    })

    // api for inserting the services to the server
    app.put('/addservice', async(req,res)=>{
      const service = req.body
      const result = await servicesdb.insertOne(service);
      res.send(result)
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