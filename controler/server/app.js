const express = require('express')
const app = express()
const port = 4000
const path_react_app = 'C:/Users/leloune/OneDrive - IMT MINES ALES/Documents/MINES/S8/UFRJ/ProgAv/alattaque/client_3000/build'
let xIsNext = true;

app.use(express.static(path_react_app))
app.use(express.json()); 

app.post('/', (req, res ) => {
    // allowed
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
    // denied
    res.send(req.body.user);
})

app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`)
  })