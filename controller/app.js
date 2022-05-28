const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const stuffRoutes = require('./routes/stuff');

const app = express();

// URL de la db en local
const url = "mongodb://localhost:27017/"

/* URL de la db sur le cloud Atlas
const url = "mongodb+srv://napoleon:alattaque@cluster0.k7gtbcl.mongodb.net/?retryWrites=true&w=majority"
*/

// Connection de la base de donnée MongoDB
mongoose.connect(url,  
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to the database !"));

// 
app.use(express.json());

// Eviter les problèmes de connection que l'utilisateur peut rencontrer pour des raisons de sécurité
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use('/api/stuff', stuffRoutes);

module.exports = app;