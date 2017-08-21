//////////
// TODO //
//////////

// Add data to excel file (i.e., name of event, countries involved, factions, aftermath, type of war, region)

/////////////////////
// INTIAL SETTINGS //
/////////////////////

var mainDuration = 1000;

//////////////////
// CREATING SVG //
//////////////////

var mainChart = d3.select('.chart-main')
    .append('svg')
    .attr('id', 'mainChart');

//////////////////////////////
// PRIMARY DRAWING FUNCTION //
//////////////////////////////

function drawPrimaryChart(conflicts) {

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

    //////////
    // AXIS //
    //////////

    d3.selectAll('.axis')
        .remove();

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .tickSize(h - 25)
        .tickFormat(d3.format(''));

    mainChart.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,25)')
        .call(xAxis);

    d3.select('.axis').selectAll('text')
        .attr("transform", "translate( 0, " + -h + ") ");

    ///////////////////////////
    // ADDING EVENT ELEMENTS //
    ///////////////////////////

    var event = mainChart.selectAll('.event')
        .data(conflicts)
        .enter()
        .append('rect')
        .attr('class', 'event') // add class to style
        .attr('x', function(d) { return xScale(d.STARTYEAR); })
        .attr('y', function(d, i) {
            console.log(yScale(i));
            return yScale(i);
        })
        .attr('width', function(d) { return xScale(d.ENDYEAR) - xScale(d.STARTYEAR); })
        .attr('height', (h / conflicts.length) * 0.80);
}

////////////////////////
// ORDERING FUNCTIONS //
////////////////////////

function orderByDeath() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.chart-main').css('width')),
        h = parseInt($('.chart-main').css('height'));

    ///////////
    // SCALE //
    ///////////

    // WARNING: 131 IS HARD CODED --- CHANGE!
    var yScale = d3.scaleLinear()
        .range([20, h])
        .domain([0, 131])

    ////////////////
    // TRANSITION //
    ////////////////

    mainChart.selectAll('.event')
        .sort(function(a, b) {
            return d3.ascending(+a.AVGFAT, +b.AVGFAT);
        })
        .transition()
        .duration(1000)
        .attr('y', function(d, i) {
            return yScale(i);
        });
}

function orderByDate() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.chart-main').css('width')),
        h = parseInt($('.chart-main').css('height'));

    ///////////
    // SCALE //
    ///////////

    // WARNING: 131 IS HARD CODED --- CHANGE!
    var yScale = d3.scaleLinear()
        .range([20, h])
        .domain([0, 131])

    ////////////////
    // TRANSITION //
    ////////////////

    mainChart.selectAll('.event')
        .sort(function(a, b) {
            return d3.ascending(a.STARTYEAR, b.STARTYEAR)
        })
        .transition()
        .duration(mainDuration)
        .attr('y', function(d, i) {
            return yScale(i);
        });
}

////////////////////////////
// INTERACTIVITY FUNCTION //
////////////////////////////

function interaction(conflicts) {

    ///////////////
    // MOUSEOVER //
    ///////////////

    d3.selectAll('.event')
        .on('mouseover', function() {
            d3.select(this)
                .classed('event-over', true)
        });

    //////////////
    // MOUSEOUT //
    //////////////

    d3.selectAll('.event')
        .on('mouseout', function() {
            d3.select(this)
                .classed('event-over', false)
        });

    //////////////////
    // RADIO BUTTON //
    //////////////////
    d3.selectAll('.radiobutton').on('click', function() {

        d3.select(this.parentNode).selectAll('.radiobutton')
            .classed('label-selected', false)

        d3.select(this)
            .classed('label-selected', true)

    })
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

            drawPrimaryChart(conflicts);
            orderByDeath();
            interaction(conflicts);

        }
    });