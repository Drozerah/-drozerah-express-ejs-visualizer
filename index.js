/**
 * Dependencies
 */
const { EjsVisualizerService } = require('./lib')

/**
 * EJS Visualizer
 *
 * @description Application-level Middleware
 * @requires EjsVisualizerService Class dependency
 * @requires ejsVisualizerHelper EJS partial helper utility
 * @param  {Object} app The Express instance
 * @param  {Object} option The middleware options
 */
const ejsVisualizer = (app, option = {}) => {
  // node env production return next()
  if (process.env.NODE_ENV === 'production') return (req, res, next) => next()
  // Handle errors
  if (!app) {
    return (req, res, next) => {
      const err = new ReferenceError('ejs-visualizer: Express instance parameter expected', 'index.js', 26)
      console.log(err) // !DEBUG
      next(err)
    }
  }
  if (!app.settings['view engine'] || app.settings['view engine'] !== 'ejs') {
    return (req, res, next) => {
      const err = new Error('ejs-visualizer: view engine required or misplaced middleware')
      console.log(err) // !DEBUG
      next(err)
    }
  }
  // get options
  const getOptions = {
    isVerbose: option.isVerbose !== undefined ? option.isVerbose : true, // whether or not to output debugging information
    color: option.txtColor !== undefined ? option.txtColor : '#FFFFFF', // .ejs-debug-view--filename color
    bgColor: option.bgColor !== undefined ? option.bgColor : '#242424', // .ejs-debug-view--filename background color
    btnZindex: option.btnZindex !== undefined ? option.btnZindex : '1000' // ejs button z-index
  }
  EjsVisualizerService.configExpressInstance(app)

  // define variables
  const views = app.settings.views
  const debugPostEndpoint = '/ejs-debug' // front form action endpoint

  return async (req, res, next) => {
    try {
      // console.log('> ejsVisualizer middleware call') // !DEBUG
      const url = await req.url // data from front form hidden input
      const body = await req.body // any posted data
      // call next if req.body is not empty and if request endpoint is not '/ejs-debug'
      if (Object.keys(body).length !== 0 && url !== debugPostEndpoint) return next()
      // call next if request is icon
      if (req.url.includes('.ico')) return next()
      // handle form POST request
      if (url === debugPostEndpoint && await req.method === 'POST') {
        // update ejs files
        await EjsVisualizerService.ejsDebugAsync(views, getOptions.isVerbose)
        // redirect to browser current path
        return res.redirect(req.body.url)
      }
      // attach front form to the response body
      const oldSend = res.send
      // set new send body content
      res.send = (body) => {
        res.send = oldSend // set function back to avoid the 'double-send'
        // if response is not a type of string (HTML) call next()
        if (typeof body !== 'string') return next(body)
        res.send(EjsVisualizerService.setNewBody(body, getOptions.color, getOptions.bgColor, getOptions.btnZindex, debugPostEndpoint, url)) // send modifyed request content
        res.on('finish', () => {
          // restore ejs files
          EjsVisualizerService.ejsRestoreAsync(views, getOptions.isVerbose)
        })
      }
      return next()
    } catch (err) {
      console.log(err) // !DEBUG
      return next(err)
    }
  }
}

module.exports = ejsVisualizer
