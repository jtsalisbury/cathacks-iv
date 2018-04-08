let express = require('express');
let router = express.Router();
let formidable = require('formidable');
let models = require('../models');
let Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

  models.Trend.find({
    order: [
      Sequelize.fn( 'RAND' ),
    ]
    }).then(function(trend) {
      if (trend != null) {
        models.Trend.findAll({
          where: {
            trendline_coef: {
              [Op.between]: [trend.trendline_coef-.5, trend.trendline_coef+.5]
            }
          }
        }).then(function(trends) {
          console.log('Found this many trends:' + trends.length);
          // here we will query for the connected CSV, load said csv, and then
          // send to the renderer. oh boy
        });
      }
    }
  );

  let matches = {
  // Trend Identifier = [file name, x column, y column,
  // start date (string), end date (string)]
    'test1': ['data.csv', 'date', 'close', '1-May-12', '26-Mar-12'],
    'test2': ['data2.csv', 'date', 'close', '1-May-12', '26-Mar-12'],
    'test3': ['data3.csv', 'date', 'close', '1-May-12', '26-Mar-12']
  };

  res.render('viz', {title: 'DVTIO',
    curTrend: trend, matches: encodeURI(JSON.stringify(matches))});
});

module.exports = router;
