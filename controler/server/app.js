const express = require('express')
const app = express()
const port = 4000
const path_react_app = 'C:/Users/leloune/OneDrive - IMT MINES ALES/Documents/MINES/S8/UFRJ/ProgAv/alattaque/client_3000/build'
let xIsNext = true;
let squares = [null, null, null, null, null, null, null, null, null]

app.use(express.static(path_react_app))
app.use(express.json()); 

app.get('/getUpdate', (req, res ) => {
    // allowed
    console.log("Get update received");
    res.json(squares);
})

app.post('/sendUpdate', (req, res ) => {
    // allowed
    console.log("Send update received");
    squares = req.body.squares;
    console.log(req.body.squares);
})

app.post('/', (req, res ) => {
    // allowed
    console.log("Received");
    if (xIsNext && req.body.user === 'X') {
        res.send("OK");
        xIsNext = !xIsNext;
    }
    else if (!xIsNext && req.body.user === 'O') {
        res.send("OK");
        xIsNext = !xIsNext;
    }
    else
       res.send("KO");
})


app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`)
  })