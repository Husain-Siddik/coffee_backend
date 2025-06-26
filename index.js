const express = require('express');
const cors = require('cors');
require('dotenv').config()//for enverment (id/pass save)
const port = process.env.PORT || 5000

const app = express()

// midleware
app.use(cors())
app.use(express.json())
// mongodb connect

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://ronysiddik21:${process.env.Db_password}@cluster0.ifyeeoo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


      app.get('/addCoffee', async (req, res) => {

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



      app.post('/addCoffee', async (req, res) => {
         const data = req.body

         const result = await CoffeeCollection.insertOne(data);
         console.log("a ddata is inserted in ", result.insertedId)
         res.send(result)

      })

      app.put('/addCoffee/:id', async (req, res) => {

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

      app.delete('/addCoffee/:id',async (req,res)=>{
         const id = req.params.id
         const query = {_id:new ObjectId(id) }
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