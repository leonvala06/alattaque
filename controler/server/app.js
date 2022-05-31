const express = require('express')
const app = express()
const port = 4000
const path_react_app = 'C:/Users/leloune/OneDrive - IMT MINES ALES/Documents/MINES/S8/UFRJ/ProgAv/alattaque/client_3000/build'

app.use(express.static(path_react_app))

app.post('/', (req, res ) => {
    console.log(req.body);
    res.json("Request sended " );
})

app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`)
  })