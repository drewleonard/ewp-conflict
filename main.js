//////////
// TODO //
//////////

// TODAY
// -- forward functionality (i.e., bar clicking behavior)
// -- reverse functionality (i.e., using map to filter, etc.)
// -- Add regions to each area dynamically
// -- Match countries / check which ones don't work
// Add data to excel file (i.e., name of event, countries involved, factions, aftermath, type of war, region)
// Color chart radio buttons on hover
// MAP
// -- fix box padding / position
// -- add automatic scaling on intialization, but think this is fixed
// TOOLTIP
// -- Event name
// -- Number of casualties
// -- Years
// SIDE BAR ON LEFT
// -- Title
// -- Region
// -- SPECIFIC INFORMATION
// -- -- Factions
// -- -- Deaths
// -- -- Aftermath
// Legend for order of bars
// Change radio button hard coding
// Resizing function
// Merging functionality (d3.v4)
// functionality when country does not exist?
// height / bar number issue (think this is fixed), but check harding coding still
//

/////////////////////
// INTIAL SETTINGS //
/////////////////////

var mainDuration = 1000,
    colorDuration = 1000 / 2;

var mapW, mapH, mapG, path, projection;

var formatComma = d3.format(',');

var region, colorScale;

///////////////////
// PAGE ELEMENTS //
///////////////////

var mainChart = d3.select('.chart-main')
    .append('svg')
    .attr('id', 'mainChart');

var map = d3.select('.map')
    .append('svg')
    .attr('id', 'map');

var tooltip = d3.select('.tooltip');

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
            return d3.ascending(a["STARTYEAR"], b["STARTYEAR"])
        })
        .transition()
        .duration(mainDuration)
        .attr('y', function(d, i) {
            return yScale(i);
        });
}

////////////////////////
// COLORING FUNCTIONS //
////////////////////////

function colorByRegion() {

    mainChart.selectAll('.event')
        .transition()
        .duration(colorDuration)
        .style('fill', function(d) {
            return colorScale(d.REGION);
        })
}

function removeColor() {
    mainChart.selectAll('.event')
        .transition()
        .duration(colorDuration)
        .style('fill', null);
}

//////////////////////////
// MAP DRAWING FUNCTION //
//////////////////////////

function drawMap(countries) {

    ////////////////
    // DIMENSIONS //
    ////////////////

    mapW = parseInt($('.map').css('width'));
    mapH = parseInt($('.map').css('height'));

    map
        .attr('width', mapW)
        .attr('height', mapH);

    mapG = map.append('g');

    ////////////
    // SCALES //
    ////////////

    projection = d3.geoMercator()
        .scale(mapW / 2 / Math.PI)
        .translate([mapW / 2, mapH / 2]);

    path = d3.geoPath().projection(projection);

    /////////////////
    // DRAWING MAP //
    /////////////////

    mapG.selectAll(".country")
        .data(countries)
        .enter()
        .insert("path", ".graticule")
        .attr("class", "country")
        .attr("id", function(d) {
            return '_' + parseInt(d.id);
            // return d.name;
        })
        .attr("d", path);
}

////////////////////////
// CENTERING FUNCTION //
////////////////////////

function center(id) {

    d3.select(id)
        .call(function(d) {

            var bounds = path.bounds(d.datum()),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / mapW, dy / mapH))),
                translate = [mapW / 2 - scale * x, mapH / 2 - scale * y];

            mapG.transition()
                .duration(750)
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

        })
}

/////////////////////////////
// INTERACTIVITY FUNCTIONS //
/////////////////////////////

function eventMouseOver(d) {

    // color bar
    d3.select(this)
        .classed('event-over', true)

    /////////////
    // TOOLTIP //
    /////////////

    // prepare text
    var pCountry = '<p class="tooltipTextPrimary">' + d.COUNTRY + '</p>',
        pDates = '<p class="tooltipTextSecondary">' + d.STARTYEAR + " - " + d.ENDYEAR + '</p>',
        pCasualties = '<p class="tooltipTextTertiary">' + formatComma(d.AVGFAT) + " casualties" + '</p>';

    // record and set locations
    var top = this.getBoundingClientRect().y,
        left = this.getBoundingClientRect().x + (this.getBoundingClientRect().width / 4);

    // add tooltip
    tooltip
        .style("display", "inline-block")
        .html(pCountry + pDates + pCasualties);
}

function eventMouseMove(d) {

    tooltip
        .style('top', function() {
            return d3.event.pageY - ($(this).height() * (3 / 2)) + "px";
        })
        .style('left', function() {
            return d3.event.pageX + "px";
        });
}

function eventMouseOut(d) {

    // remove bar color
    d3.select(this)
        .classed('event-over', false)

    tooltip
        .style('display', 'none')
}

function eventClick(d) {

    var id = '#_' + d.ISOCODE;
    // var id = '#_004'

    d3.selectAll('.country')
        .classed('country-over', false)

    d3.select(id)
        .classed('country-over', true);

    center(id);

}

function interaction(conflicts) {

    //////////////////
    // MOUSE EVENTS //
    //////////////////

    d3.selectAll('.event')
        .on('mouseover', eventMouseOver)
        .on('mousemove', eventMouseMove)
        .on('mouseout', eventMouseOut)
        .on('click', eventClick);

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

var conflicts = "conflicts.csv",
    conflicts = "ewp-conflicts-data.csv",
    countryCodeKey = "countryCodeKey.csv",
    topojsonMap = "https://unpkg.com/world-atlas@1/world/110m.json",
    countryJson = "countryIso.json";

//////////////////
// LOADING DATA //
//////////////////

d3.queue()
    .defer(d3.csv, conflicts)
    .defer(d3.csv, countryCodeKey)
    .defer(d3.json, topojsonMap)
    .defer(d3.json, countryJson)
    .await(function(error, conflicts, countryCodeKey, world, countryJson) {

        if (error) {

            throw error

        } else {

            // Data processing tasks we want to do once only

            ///////////////////
            // NON PITF DATA //
            ///////////////////

            // process world map json data
            var countries = topojson.feature(world, world.objects.countries).features;

            // connect world map data to country names
            countries = countries.filter(function(d) {
                return countryJson.some(function(n) {
                    if (d.id == n['country-code']) return d.name = n.name, d.region = n.region;
                })
            })

            // get unique region values
            region = countries.map(function(obj) { return obj.region; });
            region = region.filter(function(v, i) { return region.indexOf(v) == i; });

            // color scale
            colorScale = d3.scaleOrdinal()
                .domain(region)
                .range(["#6c71c4", "#b58900", "#dc322f", "#2aa198", "#859900"]);

            //////////////////////
            // COUNTRY CODE KEY //
            //////////////////////

            // force strings to numbers
            countryCodeKey.forEach(function(d) {
                d.cown = +d.cown
                d.iso3n = +d.iso3n
            })

            ///////////////
            // PITF DATA //
            ///////////////

            conflicts.forEach(function(d) {

                // forcing strings to integers
                d['AVGFAT'] = +(d['AVGFAT'].replace(/,/g, ""));
                d['CIVFATLOW'] = +(d['CIVFATLOW'].replace(/,/g, ""));
                d['CIVFATHIGH'] = +(d['CIVFATHIGH'].replace(/,/g, ""));
                d['COWCCODE'] = +d['COWCCODE'];
                d['STARTYEAR'] = +d['STARTYEAR'];
                d['ENDYEAR'] = +d['ENDYEAR'];
                d['DURATIONSYRS'] = +d['DURATIONSYRS'];

                // assigning region to country
                let country = countryJson.find(o => o.name === d['COUNTRY'])
                if (country !== undefined) {
                    d['REGION'] = country.region
                }

                // assigning iso code to country
                let key = countryCodeKey.find(o => o.cown === d.COWCCODE);
                if (key !== undefined) {
                    d['ISOCODE'] = key.iso3n;
                }

            });


            drawPrimaryChart(conflicts);
            orderByDeath();
            drawMap(countries);
            interaction(conflicts);

        }
    });