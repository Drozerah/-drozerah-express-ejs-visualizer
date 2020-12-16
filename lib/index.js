const fs = require('fs').promises
const path = require('path')
const express = require('express')
const getFilePathsAsync = require('recursive-readdir')
const chalk = require('chalk')
const log = console.log
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const pkg = require('./../package.json')

/**
 * EjsVisualizerService
 * ejs-visualizer static methods
 * @class
 */
class EjsVisualizerService {
  /**
   * data
   *
   * @description store variables
   * @static member of EjsVisualizerService Class
   * @returns {Object}
   */
  static data () {
    return {
      buffer: {
        prepend: Buffer.from('<%- ejsVisualizerHelper(__filename) %>\n'), // EJS pattern to write in patials
        append: Buffer.from('\n<%- ejsVisualizerHelper() %>') // EJS pattern to write in patials
      },
      img: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'
      }
    }
  }

  /**
   * configExpressInstance
   *
   * - use express.json()
   * - use express.urlencoded()
   * - set 'ejs visualizer' property
   * - add ejs helper to locals
   * @static member of EjsVisualizerService Class
   * @param  {Object} app The Express instance
   * @returns {Void} Void
   */
  static configExpressInstance (app) {
    // parse request body
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    // Instance Settings
    // add 'ejs visualizer' property
    app.set('ejs visualizer', true)
    // add ejsVisualizerHelper utility to current app.locals
    if (!app.locals.ejsVisualizerHelper) {
      app.locals = {
        ...app.locals,
        ejsVisualizerHelper: this.ejsVisualizerHelper
      }
    }
  }

  /**
   * ejsVisualizerHelper
   *
   * EJS partial helper utility
   * @description Inject given partial file name into EJS view file
   * @static member of EjsVisualizerService Class
   * @param {String|undefined} filename The partial file name
   */
  static ejsVisualizerHelper (filename) {
    if (filename) {
      return `
<div class="ejs-debug-view--filename">${filename.replace(process.cwd(), '')}</div>
<div class="ejs-debug-view--container">`
    } else {
      return '</div>'
    }
  }

  /**
   * addFrontCSS
   *
   * @description add CSS front content
   * @static member of EjsVisualizerService Class
   * @param  {String} color
   * @param  {String} bgColor
   * @return {String} A string that represents CSS rules.
   */
  static addFrontCSS (color, bgColor, btnZindex) {
    return `
/* EJS Visualizer CSS rules */
.ejs-debug-view--filename{
  font-size: 16px;
  color: ${color};
  background-color: ${bgColor};
  padding: 2px 15px 2px 15px;
  display: inline-block;
  transform: translateY(1px);
  width: max-content;
}
.ejs-debug-view--container > title, 
.ejs-debug-view--container > link, 
.ejs-debug-view--container > style, 
.ejs-debug-view--container > meta {
  display: none !important;
}
.ejs-debug-view--container * {
  display: block !important;
}
.ejs-debug-view--container{
  border: 1px dotted ${bgColor};
  padding: 20px;
  margin-bottom: 10px;
}
#ejs-debug-form{
  position: fixed;
  top: 10px;
  right: 10px;
  color: ${color};
  z-index: ${btnZindex};
}
#ejs-debug-form--button {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
}
#ejs-debug-form--button span {
  margin-left: 5px;
  color: #333;
}
#ejs-debug-form--button svg {
  fill: #333;
}
#ejs-debug-form--button:hover span {
  margin-left: 5px;
  color: #333;
}
#ejs-debug-form--button:hover svg {
  fill: #333;
}`
  }

  /**
  * addFrontJS
  *
  * @description add  JavaScript front content
  * @static member of EjsVisualizerService Class
  * @return {String} A string that represents JS code.
  */
  static addFrontJS () {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px"><path d="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z" fill="none"/><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>'
    const msg1 = `${pkg.name} ${pkg.version} enabled in ${process.env.NODE_ENV} mode.`
    // console.info('${msg1},'\n,'${msg2}')
    return `
// EJS Visualizer Front JavaScript
window.addEventListener('DOMContentLoaded', () => {
  console.log('${msg1}')
  const isDebugged = document.querySelector('.ejs-debug-view--filename')
  const button = document.getElementById('ejs-debug-form--button')
  const svg = '${svg}<span>EJS</span>'
  const form = document.getElementById('ejs-debug-form')
  if (isDebugged) button.innerHTML = svg
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (isDebugged) return location.reload()
    return e.target.submit()
  })
})`
  }

  /**
   * setNewBoby
   *
   * Turn Express req.body string to DOM object with jsdom NPM module
   * then create a HTML form and append it to document
   * @requires jsdom NPM module
   * @param  {String} body The HTML markup to work with
   * @param  {String} color CSS color property from midleware option
   * @param  {String} bgColor CSS backgroud color from midleware option
   * @param  {String} debugPostEndpoint The Form HTML tag value of action attribute
   * @param  {String} url The Input HTML tag value of value attribute
   */
  static setNewBody (body, color, bgColor, btnZindex, debugPostEndpoint, url) {
    // svg icon
    const svg = this.data().img.svg
    // instantiate new JDOM
    const DOM = new JSDOM(body)
    // ref document
    const document = DOM.window.document
    // create <style> HTML element
    const style = document.createElement('style')
    style.innerHTML = this.addFrontCSS(color, bgColor, btnZindex)
    document.head.appendChild(style)
    // create <form> HTML element
    const form = document.createElement('form')
    form.setAttribute('id', 'ejs-debug-form')
    form.setAttribute('action', debugPostEndpoint)
    form.setAttribute('method', 'POST')
    // create <input> HTML element
    const input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', 'url')
    input.setAttribute('value', url)
    // create <button> HTML element
    const btn = document.createElement('button')
    btn.setAttribute('id', 'ejs-debug-form--button')
    btn.setAttribute('type', 'submit')
    // create <span> HTML element
    const span = document.createElement('span')
    span.innerHTML = 'EJS'
    // append <form> to <body>
    document.body.appendChild(form)
    // append childs <input> and <button> to <form>
    const thisForm = document.getElementById('ejs-debug-form')
    thisForm.appendChild(input)
    thisForm.appendChild(btn)
    // append childs <svg> and <span> to <button>
    const thisButton = document.getElementById('ejs-debug-form--button')
    thisButton.innerHTML = svg
    thisButton.appendChild(span)
    // create <script> HTML element and append to <body>
    const script = document.createElement('script')
    script.innerHTML = this.addFrontJS()
    // append <script> to <body>
    document.body.appendChild(script)
    return DOM.serialize()
  }

  /**
   * bufferConcatAsync
   *
   * Returns a new Buffer which is the result of concatenating
   * all the Buffer instances in the list together.
   * @static member of EjsVisualizerService Class
   * @requires prepend Internal Class Buffer this.data().buffer.prepend
   * @requires append Internal Class Buffer this.data().buffer.append
   * @param  {Object} prepend The Buffer to add before
   * @returns {Promise} Promise Buffer Object represents concatenated Buffer
   */
  static bufferConcatAsync (content) {
    const prepend = this.data().buffer.prepend
    const append = this.data().buffer.append
    return new Promise((resolve, reject) => {
      if (!content) reject(new ReferenceError('content parameter expected', './lib/index.js', 235))
      if (Buffer.isBuffer(content) !== true) reject(new TypeError('Expected parameter to be a type of Buffer'))
      else resolve(Buffer.concat([prepend, content, append]))
    })
  }

  /**
   * ejsDebugAsync
   *
   * modify .ejs files content from an array of file paths
   * - write ejs helper before and after each .ejs file content
   * @static member of EjsVisualizerService Class
   * @requires fs Node core module
   * @requires prepend Internal Class Buffer this.data().buffer.prepend
   * @requires append Internal Class Buffer this.data().buffer.append
   * @requires chalk NPM dependency
   * @param  {String} dir The EJS views directory path
   * @param  {Boolean} isVerbose Print logs to terminal
   * @returns {Void} The modifyed .ejs files
   */
  static async ejsDebugAsync (dir, isVerbose) {
    // handle parameter errors
    if (!dir) throw new ReferenceError('dir parameter expected', './lib/index.js', 256)
    if (typeof dir !== 'string') throw new TypeError('Expected parameter to be a type of String')
    try {
      if (isVerbose) log(chalk.yellowBright('[ejs-visualizer][start]'))
      const prepend = this.data().buffer.prepend
      const append = this.data().buffer.append
      // `files` is an array of file paths
      const files = await getFilePathsAsync(dir)
      for (const file of files) {
        // todo
        // [ ] log info conditionaly according to silent mode
        if (isVerbose) log(chalk.greenBright(`[x] ${path.basename(file)}`))
        // get each file buffer
        const buffer = await fs.readFile(file)
        // check only if buffer do not includes sub buffers 'prepend' & 'append'
        if (!buffer.includes(prepend) || !buffer.includes(append)) {
          // create new content
          const newBuffer = await this.bufferConcatAsync(buffer)
          // update file content
          await fs.writeFile(file, newBuffer)
        }
      }
    } catch (err) {
      /* istanbul ignore next */
      console.log(err)
      /* istanbul ignore next */
      return err
    }
  }

  /**
   * ejsRestoreAsync
   *
   * modify .ejs files content from an array of file paths
   * - remove ejs helper before and after each .ejs file content
   * @requires fs Node core module
   * @requires prepend Internal Class Buffer this.data().buffer.prepend
   * @requires append Internal Class Buffer this.data().buffer.append
   * @param  {String} dir The EJS views directory path
   * @param  {Boolean} isVerbose Print logs to terminal
   * @returns {Void} The modifyed .ejs files
   */
  static async ejsRestoreAsync (dir, isVerbose) {
    try {
      let isdone
      const prepend = this.data().buffer.prepend
      const append = this.data().buffer.append
      const files = await getFilePathsAsync(dir)
      await Promise.all(files.map(async (file) => {
        let data = await fs.readFile(file, 'utf8')
        if (data.includes(prepend) || data.includes(append)) {
          data = data.replace(prepend, '').replace(append, '')
          data = data.trimStart().trimEnd()
          await fs.writeFile(file, data)
          isdone = true
        } else {
          isdone = false
        }
      })).then(() => {
        /* istanbul ignore next */
        if (isVerbose) {
          if (isdone) {
            log(chalk.yellowBright('[ejs-visualizer][done!]'))
          } else {
            log(chalk.yellowBright('[ejs-visualizer][watching...]'))
          }
        }
      })
    } catch (err) {
      /* istanbul ignore next */
      console.log(err)
      /* istanbul ignore next */
      return err
    }
  }
}

module.exports = { EjsVisualizerService }
