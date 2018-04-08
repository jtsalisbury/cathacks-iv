let express = require('express');
let router = express.Router();
let formidable = require('formidable');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Data Viewer Thingy'});
});

router.post('/upload', (req, res, next) => {
  // take in the form and save it
  let form = new formidable.IncomingForm();
  form.uploadDir = 'uploads';
  form.type = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
        res.redirect('/', {
          title: 'Data Viewer Thingy',
          errMsg: 'File Upload Failed!'
        });
      } else {
        res.redirect('/viz?trend=' + fields.title);
      }
  });
});

router.get('/viz', function(req, res, next) {
  let trend = req.query.trend;

  res.render('viz', {title: 'View Data', trend: trend});
});

module.exports = router;
