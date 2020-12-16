class AppController {
  static getIndex (req, res, next) {
    res.render('index', {
      title: 'EJS Visualizer',
      pageName: 'home',
      content: 'This is the home page.'
    })
  }

  static getAbout (req, res, next) {
    res.render('about', {
      title: 'EJS Visualizer',
      pageName: 'about',
      content: 'This is the about page.'
    })
  }

  static postTest (req, res, next) {
    res.send('ok')
  }
}

module.exports = AppController
