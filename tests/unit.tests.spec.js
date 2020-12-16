const chalk = require('chalk')
// const fs = require('fs').promises
const fs = require('fs-extra')
const options = {
  mode: 0o2775
}
const path = require('path')
const {
  describe
} = require('mocha')
const chai = require('chai')

const {
  expect
} = require('chai')

const chaiAsPromised = require('chai-as-promised') // https://github.com/domenic/chai-as-promised#readme

chai.use(chaiAsPromised)

const {
  EjsVisualizerService
} = require('../lib')

const tempDir = path.join(process.cwd(), 'tests', 'fixtures', 'temp') // ejs views directory path

// Snippet
// describe('', function () {
//   it('', function () {
//     expect('').to.be.equal('')
//   })
// })

const dummyPromise = (delay) => {
  return new Promise((resolve, reject) => {
    const err = new Error('Rejected')
    if (!delay) return reject(err)
    return setTimeout(() => {
      return resolve(delay)
    }, delay)
  })
}

describe(`${chalk.yellow(`> mocha ${path.basename(__filename)}\n`)}`, function () {
  describe('Start with dummy tests', function () {
    it('is passed', function () {
      return expect(true).to.be.true
    })
    it('is passed Promise all', () => {
      const delay = 1000
      return Promise.all([
        expect(dummyPromise(delay)).to.be.fulfilled,
        expect(dummyPromise(delay)).to.eventually.equal(delay),
        expect(dummyPromise()).to.be.rejected,
        expect(dummyPromise()).to.be.rejectedWith(Error, 'Rejected')
      ])
    })
  })

  describe('Test suit for Class EjsVisualizerService members:', function () {
    describe('tests for .ejsVisualizerHelper', function () {
      it('should return well formatted HTML markup', function () {
        const expected = `
<div class="ejs-debug-view--filename">${__filename.replace(process.cwd(), '')}</div>
<div class="ejs-debug-view--container">`
        expect(EjsVisualizerService.ejsVisualizerHelper(__filename)).to.be.equal(expected)
        expect(EjsVisualizerService.ejsVisualizerHelper()).to.be.equal('</div>')
      })
    })
    describe('tests for .bufferConcatAsync Promise:', function () {
      it('is rejected with ReferenceError', function () {
        return Promise.all([
          expect(EjsVisualizerService.bufferConcatAsync()).to.be.rejected,
          expect(EjsVisualizerService.bufferConcatAsync()).to.be.rejectedWith(ReferenceError, 'content parameter expected')
        ])
      })

      it('is rejected with TypeError', function () {
        return Promise.all([
          expect(EjsVisualizerService.bufferConcatAsync(1)).to.be.rejected,
          expect(EjsVisualizerService.bufferConcatAsync(1)).to.be.rejectedWith(TypeError, 'Expected parameter to be a type of Buffer'),
          expect(EjsVisualizerService.bufferConcatAsync('arg1')).to.be.rejected,
          expect(EjsVisualizerService.bufferConcatAsync('arg1')).to.be.rejectedWith(TypeError, 'Expected parameter to be a type of Buffer')
        ])
      })

      it('is fulfilled with expected output Buffer', function () {
        const content = Buffer.from('<h1>Hello</h1>')
        const prepend = EjsVisualizerService.data().buffer.prepend
        const append = EjsVisualizerService.data().buffer.append
        const concat = `${prepend}${content}${append}`
        return Promise.all([
          expect(EjsVisualizerService.bufferConcatAsync(content)).to.be.fulfilled,
          expect(EjsVisualizerService.bufferConcatAsync(content).then(result => Buffer.isBuffer(result))).to.eventually.equal(true),
          expect(EjsVisualizerService.bufferConcatAsync(content).then(result => result.toString())).to.eventually.equal(concat)
        ])
      })
    })

    describe('tests for .ejsDebugAsync Promise: ', function () {
      it('is rejected with ReferenceError', function () {
        return Promise.all([
          expect(EjsVisualizerService.ejsDebugAsync()).to.be.rejected,
          expect(EjsVisualizerService.ejsDebugAsync()).to.be.rejectedWith(ReferenceError, 'dir parameter expected')
        ])
      })

      it('is rejected with TypeError', function () {
        return Promise.all([
          expect(EjsVisualizerService.ejsDebugAsync()).to.be.rejected,
          expect(EjsVisualizerService.ejsDebugAsync({})).to.be.rejectedWith(TypeError, 'Expected parameter to be a type of String')
        ])
      })

      it('is fulfilled', function () {
        return Promise.all([
          expect((async () => {
            try {
              // create tests/fixture/temp directory if necesary
              await fs.ensureDir(path.join(__dirname, 'fixtures', 'temp'), options)
              // create fixture file
              // create fixture filename
              const fileName = `${Date.now()}.ejs`
              // create fixture file path
              const fixtureFile = path.join(__dirname, 'fixtures', 'temp', fileName)
              // create prepend Buffer
              const prepend = EjsVisualizerService.data().buffer.prepend
              // create append Buffer
              const append = EjsVisualizerService.data().buffer.append
              // append file to fixture directory
              await fs.appendFile(fixtureFile, 'This is a test content in a fixture .ejs file')
              console.log(`      > set up fixture file ${path.basename(fixtureFile)}`) // !DEBUG
              // run ejsDebugAsync method
              await EjsVisualizerService.ejsDebugAsync(tempDir, prepend, append)
              // run ejsDebugAsync method
              await EjsVisualizerService.ejsDebugAsync(tempDir, prepend, append)
              // read fixtureFile Buffer
              const buffer = await fs.readFile(fixtureFile)
              // remove fixtureFile
              await fs.unlink(fixtureFile)
              console.log(`      > tear down fixture file ${path.basename(fixtureFile)}`) // !DEBUG
              // check if buffer includes expected buffer chunks
              if (buffer.includes(prepend) && buffer.includes(append)) {
                return true
              } else {
                throw Error(false)
              }
            } catch (err) {
              return err
            }
          })()).to.eventually.equal(true)
        ])
      })
    })
  })
})
