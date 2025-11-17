const express = require('express');
const cors = require('cors');
require('dotenv').config()//for enverment (id/pass save)
const port = process.env.PORT || 5000

const app = express()

//JWT Token 

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
//

// midleware
app.use(cors({
   origin: [
      'http://localhost:5173',
      'https://coffee-store-9.netlify.app',

   ],
   credentials: true
}));

app.use(express.json())
app.use(cookieParser()) 

const logger = (req,res, next ) =>{
   //console.log( 'inside the logger middelwar');
   next(); // otherwise this will stop going forward
}

const verifyToken  = (req, res, next ) =>{

   const token  =  req?.cookies?.token 
   
   if(!token){
      return res.status(401).send({ massage : 'unauthorized access'})
   }
   //verify 
   jwt.verify(token,process.env.Jwt_ACCES_SECRET , (error , decoded ) => {

      if(error){
         return res.status(401 ).send({ massage : 'unAuthrozied access'})
      }
      req.decoded = decoded;
      next()

   } )
   
 

}

// mongodb connect


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   }
});

async function run() {
   try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();

      const CoffeeCollection = client.db("CoffeeDB").collection("coffee")

      // jwt token related apis 
      // app.post('/jwt', async (req, res) => {

      //    const { email } = req.body;
      //    const user = { email };

      //    const token = jwt.sign(user, process.env.Jwt_ACCES_SECRET, { expiresIn: '1d' });

      //    res.cookie('token', token, {

      //       httpOnly: true,
      //       secure: false
      //    })

      //    res.send({ succes: true })


      // })

      app.post('/jwt', async (req, res) => {

         const userData = req.body;
         const token = jwt.sign(userData, process.env.Jwt_ACCES_SECRET, { expiresIn: '1d' })

            // set token in the cookies
         
            res.cookie("token" , token ,{

               httpOnly:true,
               secure : false,
               sameSite: "lax",
            
            } )


         res.send({ success: true })

      })






      //

      app.get('/addCoffee', logger,  async (req, res) => {

         //console.log(req.cookies);
         

         const cursor = CoffeeCollection.find();
         const result = await cursor.toArray();
         res.send(result)

      })

      app.get('/addCoffee/:id', async (req, res) => {
         const id = req.params.id
         const queary = { _id: new ObjectId(id) }
         const coffee = await CoffeeCollection.findOne(queary);

         res.send(coffee)

      })



      app.post('/addCoffee',verifyToken, async (req, res) => {
         const data = req.body

         const result = await CoffeeCollection.insertOne(data);
         console.log("a ddata is inserted in ", result.insertedId)
         res.send(result)

      })

      app.put('/addCoffee/:id',verifyToken, async (req, res) => {

         const id = req.params.id;
         const data = req.body;
         const filter = { _id: new ObjectId(id) };
         const options = { upsert: true };

         const updatedcoffee = {
            $set: {
               coffeename: data.coffeename,
               chefName: data.chefName,
               supplyername: data.supplyername,
               taste: data.taste,
               category: data.category,
               details: data.details,
               imgeurl: data.imgeurl,
            },
         };
         const result = await CoffeeCollection.updateOne(filter, updatedcoffee, options);
         res.send(result)
         console.log(
            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
         );

      })

      app.delete('/addCoffee/:id',verifyToken, async (req, res) => {
         const id = req.params.id
         const query = { _id: new ObjectId(id) }
         const result = await CoffeeCollection.deleteOne(query)
         res.send(result)


      })






      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
      // Ensures that the client will close when you finish/error
      //await client.close();
   }
}
run().catch(console.dir);






app.get('/', (req, res) => {
   res.send("server is running data is comming")
})

app.listen(port, () => {
   console.log(` server is running on port -> ${port}`);

})