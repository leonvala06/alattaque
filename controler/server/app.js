const express = require('express');
const app = express();
const port = 3000;
const path_react_app = 'C:/Users/Tristan/Documents/Stratego/alattaque/client_3000/build';


//const stuffRoutes = require('./routes/stuffTest');
app.use(express.static(path_react_app))
app.use(express.json()); 


// Eviter les problèmes de connection que l'utilisateur peut rencontrer pour des raisons de sécurité
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
/*
//app.use('/api/stuffTest', stuffRoutes);*/

///// FONCTIONS /////



///// ROUTES PRINCIPALES /////

app.post('/', (req, res, next) => {     // Vérifier l'attribut du joueur
    console.log('post reçu');
    console.log(req.body);

    xIsNext = !(req.body.joueur);     // Changer l'attribut du joueur
    


    res.send('ensemble des informations');
  });
/* 
app.post('/', (req, res, next) => {       
    console.log('post reçu');
    console.log(req.body);
    res.send(req.body.user)
    next();
  });
*/

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});