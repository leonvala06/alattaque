const express = require('express')
const app = express()
const port = 4000
const path_react_app = 'C:/Users/Tristan/Documents/Stratego/alattaque/client_3000/build'

app.use(express.static(path_react_app))

app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`)
  })
