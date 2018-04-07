let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Data Viewer Thingy' });
});

router.post('/upload', function(req, res, next) {
  res.render('upload', { title: 'Upload' });
});

router.post('/viz', function(req, res, next) {
  var trend = req.body.trend;

  res.render('viz', { title: 'View Data', trend: trend  });
});



module.exports = router;
