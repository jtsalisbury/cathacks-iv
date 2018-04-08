$(document).ready(function() {
  let margin = {top: 20, right: 20, bottom: 30, left: 50};
  let width = 960 - margin.left - margin.right;
  let height = 500 - margin.top - margin.bottom;

  console.log(matches);

  for (let m in matches) {
    if (m == curTrend) {
      continue;
    }

    $('.trendSelect').append('<option value=' + m + '>' + m + '</option>');
  }

  let baseTrendData = matches[curTrend];
  let baseTrendX = baseTrendData[1];
  let baseTrendY = baseTrendData[2];

  var lines = $.ajax({
    url: './' + uploadDir + '/' + baseTrendData[0],
    success: function(res) {
      var lines = res.split("\n");
      var headers = lines[0].split(",");

      for (var i = 0; i < headers.length; i++) {
        if (i == baseTrendX) {
          baseTrendX = headers[i].trim();

          console.log('Found x! ' + baseTrendX);
        }

        if (i == baseTrendY) {
          baseTrendY = headers[i].trim();

          console.log('Found y! ' + baseTrendY);
        }
      }

      let baseTrend = d3.line()
        .x(function(d) {
          return x(d[baseTrendX]);
        })
        .y(function(d) {
          return y(d[baseTrendY]);
        });

        d3.csv(uploadDir + '/' + matches[curTrend][0], function(error, data) {
          if (error) throw error;

          // format the data
          data.forEach(function(d) {
              d[baseTrendX] = parseTime(d[baseTrendX]);
              d[baseTrendY] = +d[baseTrendY];
          });

          // Scale the range of the data
          x.domain(d3.extent(data, function(d) {
            return d[baseTrendX];
          }));
          y.domain([0, d3.max(data, function(d) {
            return d[baseTrendY];
          })]);

          // Add the valueline path.
          svg.append('path')
              .data([data])
              .attr('class', 'baseLine')
              .attr('d', baseTrend);

          // Add the X Axis
          svg.append('g')
              .attr('transform', 'translate(0,' + height + ')')
              .call(d3.axisBottom(x));

          // Add the Y Axis
          svg.append('g')
              .call(d3.axisLeft(y));

          $('#baseTrend').text(curTrend);
        });
      }
  })

  // parse the date / time
  let parseTime = d3.timeParse('%d-%b-%y');

  // set the ranges
  let x = d3.scaleTime().range([0, width]);
  let y = d3.scaleLinear().range([height, 0]);

  // define the line
  

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  let svg = d3.select('#graph').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

  // Get the data
  

  // Generates the graph for the targetted line
  function generateTargetLine(target) {
    let targetTrendX = matches[target][1];
    let targetTrendY = matches[target][2];

    let targetTrend = d3.line()
      .x(function(d) {
        return x(d[targetTrendX]);
      })
      .y(function(d) {
        return y(d[targetTrendY]);
      });

    d3.csv(uploadDir + '/' + matches[target][0], function(error, data) {
      if (error) throw error;

      // format the data
      data.forEach(function(d) {
          d[targetTrendX] = parseTime(d[targetTrendX]);
          d[targetTrendY] = +d[targetTrendY];
      });

      // Scale the range of the data
      x.domain(d3.extent(data, function(d) {
        return d[targetTrendX];
      }));
      y.domain([0, d3.max(data, function(d) {
        return d[targetTrendY];
      })]);

      // Add the valueline path.
      svg.append('path')
          .data([data])
          .attr('class', 'targetLine')
          .attr('d', targetTrend)
          .style('stroke', 'orange');

      // Add the X Axis
      svg.append('g')
          .attr('transform', 'translate(0,' + height + ')')
          .call(d3.axisBottom(x));

      // Add the Y Axis
      svg.append('g')
          .call(d3.axisLeft(y));

      $('#targetTrend').text(target);
    });
  }

  $(document).on('change', '.trendSelect', function(e) {
    let target = this.options[e.target.selectedIndex].text;
    d3.select('path.targetLine').remove();

    if (e.target.selectedIndex == 0) {
      $('#targetTrend').text('');

      return;
    }

    generateTargetLine(target);
  });
});
