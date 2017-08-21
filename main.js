//////////
// TODO //
//////////

//////////////////
// CREATING SVG //
//////////////////

var mainChart = d3.select('.chart-main')
    .append('svg')
    .attr('id', 'mainChart');
// .attr('width', w)
// .attr('height', h)
// .append('g')
// .attr('id', 'mainChartG');

////////////////
// INITIALIZE //
////////////////

function drawMainChart(conflicts) {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.chart-main').css('width')),
        h = parseInt($('.chart-main').css('height'));

    mainChart
        .attr('width', w)
        .attr('height', h);

    ////////////
    // SCALES //
    ////////////

    var xScale = d3.scaleLinear()
        .range([0, w])
        .domain([
            d3.min(conflicts, function(d) { return d.STARTYEAR || Infinity; }),
            d3.max(conflicts, function(d) { return d.STARTYEAR; })
        ]);

    var yScale = d3.scaleLinear()
        .range([20, h])
        .domain([0, conflicts.length]);

    ///////////////////////////
    // ADDING EVENT ELEMENTS //
    ///////////////////////////

    var event = mainChart.selectAll('.event')
        .data(conflicts)
        .enter()
        .append('rect')
        .attr('class', 'event') // add class to style
        .attr('x', function(d) { return xScale(d.STARTYEAR); })
        .attr('y', function(d, i) { return yScale(i); })
        .attr('width', function(d) { return xScale(d.ENDYEAR) - xScale(d.STARTYEAR); })
        .attr('height', (h / conflicts.length) * 0.90);

    //////////
    // AXIS //
    //////////

    d3.selectAll('.axis')
        .remove();

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(10)
        .tickSize(h - 25)
        .tickFormat(d3.format(''));

    mainChart.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,25)')
        .call(xAxis);

    var labelPos = -h

    d3.select('.axis').selectAll('text')
        .attr("transform", "translate( 0, " + labelPos + ") ")



}

/////////////////
// NAMING DATA //
/////////////////

conflicts = "ewp-conflicts-data.csv";

//////////////////
// LOADING DATA //
//////////////////

d3.queue()
    .defer(d3.csv, conflicts)
    .await(function(error, conflicts) {
        if (error) {
            throw error
        } else {

            // converting strings to numbers
            conflicts.forEach(function(d) {
                d['AVGFAT'] = +(d['AVGFAT'].replace(/,/g, ""));
                d['CIVFATLOW'] = +(d['CIVFATLOW'].replace(/,/g, ""));
                d['CIVFATHIGH'] = +(d['CIVFATHIGH'].replace(/,/g, ""));
                d['COWCCODE'] = +d['COWCCODE'];
                d['STARTYEAR'] = +d['STARTYEAR'];
                d['ENDYEAR'] = +d['ENDYEAR'];
                d['DURATIONYRS'] = +d['DURATIONYRS']
            });

            // console.log(conflicts);

            drawMainChart(conflicts);

        }
    });