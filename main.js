//////////
// TODO //
//////////

// Add data to excel file (i.e., name of event, countries involved, factions, aftermath, type of war, region)
// Color chart radio buttons on hover
// MAP
// -- fix box padding / position
// TOOLTIP
// -- Event name
// -- Number of casualties
// -- Years
// SIDE BAR ON LEFT
// -- Title / general information
// -- SPECIFIC INFORMATION
// -- -- Factions
// -- -- Deaths
// -- -- Aftermath
// Legend for order of bars
// Change radio button hard coding

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

var map = d3.select('.map')
    .append('svg')
    .attr('id', 'map');

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

    // WARNING: 131 IS HARD CODED!
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

    // WARNING: 131 IS HARD CODED!
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

//////////////////////////
// MAP DRAWING FUNCTION //
//////////////////////////

function drawMap(countries) {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.map').css('width')),
        h = parseInt($('.map').css('height'));

    map
        .attr('width', w)
        .attr('height', h);

    ////////////
    // SCALES //
    ////////////

    var projection = d3.geoMercator()
        .scale(400 / 2.50 / Math.PI) // 400 === width
        .translate([400 / 2.75, 200 / 1.50]) // 200 === height

    var path = d3.geoPath().projection(projection);

    /////////////////
    // DRAWING MAP //
    /////////////////

    map.selectAll(".country")
        .data(countries)
        .enter()
        .insert("path", ".graticule")
        .attr("class", "country")
        .attr("d", path);

}

/////////////////
// NAMING DATA //
/////////////////

var conflicts = "ewp-conflicts-data.csv",
    topojsonMap = "https://unpkg.com/world-atlas@1/world/110m.json",
    countryNames = "world-country-names.tsv";

//////////////////
// LOADING DATA //
//////////////////

d3.queue()
    .defer(d3.csv, conflicts)
    .defer(d3.json, topojsonMap)
    .defer(d3.tsv, countryNames)
    .await(function(error, conflicts, world, countryNames) {
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
                d['DURATIONYRS'] = +d['DURATIONYRS'];
            });

            // process world map json data
            var countries = topojson.feature(world, world.objects.countries).features;

            // connect world map data to country names
            countries = countries.filter(function(d) {
                return countryNames.some(function(n) {
                    if (d.id == n.id) return d.name = n.name;
                })
            })

            drawPrimaryChart(conflicts);
            orderByDeath();
            interaction(conflicts);
            drawMap(countries);

        }
    });