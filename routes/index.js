let express = require('express');
let router = express.Router();
let formidable = require('formidable');
let models = require('../models');
let fs = require('fs');
let moment = require('moment');
let csv = require('csv-parser');
let regression = require('regression');
let Sequelize = require('sequelize');
const Op = Sequelize.Op;

// Date constants
const DATE_FORMAT = ['MM-DD-YYYY',
                     'DD-MM-YYYY',
                     'DD-MM-YY',
                     'MM-DD-YY',
                     'YYYY'];
const MIN_DATE = '08/23/0000';
const MAX_DATE = '08/23/9999';

// file constants
const UPLOAD_DIR = process.env.STORAGE;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'DVTIO'});
});

router.post('/upload', (req, res, next) => {
  // keep a collection of records
  let records = [];

  // take in the form and save it
  let form = new formidable.IncomingForm();
  form.uploadDir = UPLOAD_DIR;
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
        res.redirect('/', {
          title: 'DVTIO',
          errMsg: 'File Upload Failed!'
        });
      } else {
        // if there was not an error with saving the file
        // then try to read it as a csv
        if (!files.file.path) {
          res.render('index',
                    {title: 'Data Viewer Thingy',
                    errMsg: 'unknown error'});
          return;
        }

        // if the file was uploaded successfully
        // then parse the csv and add it to the database
        files.file.title = fields.title;
        fs.createReadStream(files.file.path)
          .pipe(csv())
          .on('error', (err) => {
            res.render('index',
                       {title: 'Data Viewer Thingy',
                       errMsg: 'File parsing failed. Is this a csv?'});
          })
          .on('headers', (headers) => {
            records.push(headers);
          })
          .on('data', getProcFunc(records, files.file))
          .on('end', getEndFunc(records, files.file));

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

function getProcFunc(acc, file) {
  return function processDataRow(data) {
    // add the row to the list of rows
    acc.push(data);
  };
}

function getEndFunc(acc, file) {
  return function endData() {
    let headers = acc[0];
    let data = acc.slice(1);

    // get the column with time values
    // start by taking columns with valid dates in them
    let timeColCands = [];
    for (let prop in data[0]) {
        if (moment(data[0][prop],
            DATE_FORMAT,
            'en').isValid()) {
          timeColCands.push(prop);
        }
    }

    // if no column has a valid date value
    // then there is an error
    if (timeColCands.length == 0) {
      return;
    }

    // go through timeColCands and get the biggest range
    let greatestRng = {key: '',
                       val: 0,
                       min: moment(MAX_DATE, DATE_FORMAT, 'en'),
                       max: moment(MIN_DATE, DATE_FORMAT, 'en')};
    timeColCands.forEach((col)=>{
    // headers.forEach((col) => {
      // for each candidate column, get the range
      // by getting the min and max date for the column

      let minMoment = moment(MAX_DATE, DATE_FORMAT, 'en');
      let maxMoment = moment(MIN_DATE, DATE_FORMAT, 'en');
      let rowStart = 0;

      if (data.length % 2 != 0) {
        minMoment = moment(data[0][col], DATE_FORMAT, 'en');
        maxMoment = moment(data[0][col], DATE_FORMAT, 'en');
        rowStart = 1;
      }

      for (let row = rowStart; row < data.length; row+=2) {
        let momentA = moment(data[row][col],
                             DATE_FORMAT,
                             'en');
        let momentB = moment(data[row+1][col],
                             DATE_FORMAT,
                             'en');

        if (momentCompare(momentA, momentB) < 0) {
          // if row < row+1
          // then compare row to min and row+1 to max
          if (momentCompare(momentA, minMoment) < 0) {
            minMoment = momentA;
          }
          if (momentCompare(maxMoment, momentB) < 0) {
            maxMoment = momentB;
          }
        } else if (momentCompare(momentA, momentB > 0)) {
          // if row >= row+1, then compare row to max and row+1 to min
          if (momentCompare(momentB, minMoment) < 0) {
            minMoment = momentB;
          }
          if (momentCompare(maxMoment, momentA) < 0) {
            maxMoment = momentA;
          }
        }
      }

      // and compare the range to the current max
      let currRng = moment.duration(minMoment.diff(maxMoment)).asMonths();

      if (greatestRng.val < Math.abs(currRng)) {
        greatestRng.key = col;
        greatestRng.val = currRng;
        greatestRng.min = minMoment;
        greatestRng.max = maxMoment;
      }
    });

    // process the records in this csv

    // CsvData: stores the data for each csv file
    // make a new entry in CsvData
    models.CsvData.create({
      path: file.path.slice(UPLOAD_DIR.length+1),
      title: file.title,
      x_col: headers.indexOf(greatestRng.key),
      start_date: new Date(greatestRng.min),
      end_date: new Date(greatestRng.max),
      interval: -1
    }).then((csvData)=>{
      // TrendData: stores the coefficient for every column
    // for each column, make a new entry in TrendData
    for (let prop in data[0]) {
      // skip if this is the time column
      if (prop == greatestRng.key) continue;

      // calculate the slope
      // get a list of points (x=months,y=val)
      let points = [];
      data.forEach( (row) => {
        let y = parseFloat(row[prop]);
        let x = parseFloat(row[greatestRng.key]);
        points.push([x, y]);
      });

      let model = regression.linear(points);
      console.log(`equation: ${JSON.stringify(model)}`);
      console.log(`slope for ${prop}: ${model.equation[0]}`);
      console.log(`% explained variability for ${prop}: ${model.r2}`);

      models.Trend.create({
        title: prop,
        y_col: headers.indexOf(prop),
        trendline_coef: model.equation[0],
        CsvDatumId: csvData.id
      });
    }
    });
  };
}

// takes to moments (momentJS) and compares them
function momentCompare(momA, momB) {
  if (momA === null ||
      momB === null ||
      momA === undefined ||
      momB === undefined) {
    return 0;
  }

  if (momA.isSame(momB)) {
    return 0;
  } else if (momA.isBefore(momB)) {
    return -1;
  } else {
    return 1;
  }
}
