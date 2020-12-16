const chalk = require('chalk')
const path = require('path')

const { describe } = require('mocha')
const chai = require('chai')
const { expect } = require('chai')
const chaiHttp = require('chai-http')
const chaiDom = require('chai-dom') // https://www.chaijs.com/plugins/chai-dom/
const jsdom = require('jsdom') // https://github.com/jsdom/jsdom
const { JSDOM } = jsdom

// clean views files
const { EjsVisualizerService } = require('../lib/index')
const views = path.join(process.cwd(), './tests/fixtures/server/views')

const app = require('./fixtures/server/server')

// Configure chai
chai.use(chaiHttp)
chai.use(chaiDom)
chai.should()

describe(`${chalk.yellow(`> mocha ${path.basename(__filename)}\n`)}`, function () {
  after(function () {
    EjsVisualizerService.ejsRestoreAsync(views).then(
      console.log(chalk.green('\n[x] clean ejs files after test suit done!'))
    )
  })
  describe('Start with dummy test', function () {
    it('is passed', function () {
      expect('drozerah').to.be.equal('drozerah')
    })
  })
  describe('GET /', () => {
    it('should get the root path', function (done) {
      chai.request(app).get('/').end((err, res) => {
        if (err) done(err)
        const { document } = (new JSDOM(res.text)).window
        expect(res).to.have.status(200)
        expect(res).to.have.header('content-type', 'text/html; charset=utf-8')
        expect(document.querySelector('script').should.exist)
        done()
      })
    })
    it('should have <script> tag', function (done) {
      chai.request(app).get('/').end((err, res) => {
        if (err) done(err)
        const { document } = (new JSDOM(res.text)).window
        expect(document.querySelector('script').should.exist)
        done()
      })
    })
    it('should have <style> tag', function (done) {
      chai.request(app).get('/').end((err, res) => {
        if (err) done(err)
        const { document } = (new JSDOM(res.text)).window
        expect(document.querySelector('style').should.exist)
        done()
      })
    })
    it('should have <form> tag', function (done) {
      chai.request(app).get('/').end((err, res) => {
        if (err) done(err)
        const { document } = (new JSDOM(res.text)).window
        expect(document.querySelector('form').should.exist)
        expect(document.querySelector('form')).to.have.id('ejs-debug-form')
        done()
      })
    })
    it('should have <button> tag', function (done) {
      chai.request(app).get('/').end((err, res) => {
        if (err) done(err)
        const { document } = (new JSDOM(res.text)).window
        expect(document.querySelector('button').should.exist)
        expect(document.querySelector('button')).to.have.id('ejs-debug-form--button')
        expect(document.querySelector('button').should.have.attr('type').match(/submit/))
        done()
      })
    })
  })
  describe('POST /ejs-debug', function () {
    it('should redirect with status of 302', function (done) {
      chai.request(app)
        .post('/ejs-debug')
        .send({ url: '/' })
        .redirects(0)
        .end((err, res) => {
          if (err) done(err)
          expect(res).to.have.status(302)
          done()
        })
    })
  })
})
