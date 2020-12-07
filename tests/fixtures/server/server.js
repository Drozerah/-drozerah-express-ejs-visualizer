const express = require('express')
const app = express()
const path = require('path')
const ejsVisualizer = require('../../../index')
const AppController = require('./controllers/appController')
const pkg = require('./../../../package.json')

const date = new Date(Date.now())
const getYear = date.getFullYear()

app.locals.app = {
  getYear,
  middleware: {
    name: pkg.name,
    version: pkg.version
  }
}

// define public folder
app.use(express.static(path.join(__dirname, './public')))
// define view engine
app.set('view engine', 'ejs')
// define views directory
app.set('views', path.join(__dirname, 'views'))

// ejs-visualizer Middleware
app.use(ejsVisualizer(app, {
  txtColor: '#FFF', // ejs-visualizer displayed .ejs file name text color CSS property - type of string - optional - default #FFFFFF
  bgColor: '#33c09f4a', // ejs-visualizer displayed .ejs file name background color CSS property - type of string - optional  - default #242424
  isVerbose: true, // ejs-visualizer terminal ouput debugging informations - type of boolean - optional - default true
  btnZindex: 2000 // ejs-visualizer front button z-index CSS property - type of Number - optional - default 1000
}))

// Routes
app.get('/', AppController.getIndex)
app.get('/about', AppController.getAbout)

// 404
app.use((req, res, next) => {
  return res.status(404).send({ message: 'Route' + req.url + ' Not found.' })
})

// 500 - Any server error
app.use((err, req, res, next) => {
  return res.status(500).send({
    error: err.name,
    message: err.message,
    stack: err.stack
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, function () {
  console.log(`[APP][NODE_ENV][${app.get('env')}]`) // !DEBUG
  console.log(`[APP][Listen]\n> http://localhost:${this.address().port}`) // !DEBUG
  // console.log(server) // !DEBUG
})

module.exports = app
