let express = require('express');
let router = express.Router();
let formidable = require('formidable');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'DVTIO'});
});

router.post('/upload', (req, res, next) => {
  // take in the form and save it
  let form = new formidable.IncomingForm();
  form.uploadDir = 'uploads';
  form.type = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
        res.redirect('/', {
          title: 'DVTIO',
          errMsg: 'File Upload Failed!'
        });
      } else {
        // This passes the current trend we are interested in
        res.redirect('/viz?curTrend=' + fields.title);
      }
  });
});

// Take the trend we are interested in and compile a list of matching ones
router.get('/viz', function(req, res, next) {
  let trend = req.query.trend;

  let matches = {
  // Trend Identifier = [file name, x column, y column,
  // start date (string), end date (string)]
    'test1': ['data.csv', 'date', 'close', '1-May-12', '26-Mar-12'],
    'test2': ['data2.csv', 'date', 'close', '1-May-12', '26-Mar-12']
  };

  res.render('viz', {title: 'View Data',
    curTrend: trend, matches: encodeURI(JSON.stringify(matches))});
});

module.exports = router;
