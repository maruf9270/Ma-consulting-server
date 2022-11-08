require('dotenv').config()
const express = require('express');
const cors = require('cors');


const app = express()
// Declearing port
const port = process.env.PORT || 4000;
// Using middleware
app.use(cors());
app.use(express.json());
// Route for testing purpose
app.get('/',(req,res)=>{res.send('Server is running')})


// Fireng up the server
app.listen(port, ()=>{console.log(`Youe server is running on port:${port}`);})