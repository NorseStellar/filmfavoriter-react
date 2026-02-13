require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let filmerCollection;

// Startar server och kopplar till MongoDB Atlas.
async function start() {
   try {
      await client.connect();
      console.log("Uppkopplad mot MongoDB Atlas");

      const db = client.db("filmer_db"); // Databasen.
      filmerCollection = db.collection("filmer_collection"); // Collection.

      app.listen(4000, () => {
         console.log("API körs på http://localhost:4000 och för JSON-data se http://localhost:4000/filmer ");
      });
   } catch (error) {
      console.error("Fel vid uppstart:", error);
   }
}

start();

// GET /filmer — hämtar alla filmer.
app.get("/filmer", async (req, res) => {
   try {
      const filmer = await filmerCollection.find().toArray();
      res.json(filmer);
   } catch (err) {
      res.status(500).json({ error: "Filmerna kunde inte hämtas" });
   }
});

// POST /filmer - lägg till film.
app.post("/filmer", async (req, res) => {
   try {
      const nyFilm = req.body;

      const result = await filmerCollection.insertOne(nyFilm);

      // Hämta den sparade filmen med _id.
      const sparadFilm = await filmerCollection.findOne({ _id: result.insertedId });

      res.status(201).json(sparadFilm);
   } catch (err) {
      res.status(500).json({ error: "Kunde inte lägga till film" });
   }
});

// DELETE /filmer - ta bort film.
app.delete("/filmer/:id", async (req, res) => {
   try {
      const id = req.params.id;

      await filmerCollection.deleteOne({ _id: new ObjectId(id) });

      res.json({ message: "Filmen är borttagen" });
   } catch (err) {
      res.status(500).json({ error: "Kunde inte ta bort filmen" });
   }
});
