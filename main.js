//////////
// TODO //
//////////

// TODAY
// -- forward functionality (i.e., bar clicking behavior)
// -- reverse functionality (i.e., using map to filter, etc.)
// -- Check which countries don't work
// Add data to excel file (i.e., name of event, countries involved, factions, aftermath, type of war, region)
// Color chart radio buttons on hover
// MAP
// -- add automatic scaling on intialization
// TOOLTIP
// -- Event name
// -- Number of casualties
// -- Years
// SIDE BAR ON LEFT
// Legend for order of bars
// Change radio button hard coding
// Resizing function
// Merging functionality (d3.v4)
// functionality when country does not exist?
// height / bar number issue (think this is fixed), but check harding coding still

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var primaryDuration = 1000,
    secondaryDuration = 750;

var eventOpacity = 0.30;

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
        .attr('class', 'event')
        .attr('id', function(d) { return d.ISOCODE; })
        .attr('x', function(d) { return xScale(d.STARTYEAR); })
        .attr('y', function(d, i) { return yScale(i); })
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
        .duration(primaryDuration)
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
        .duration(secondaryDuration)
        .style('fill', function(d) {
            return colorScale(d.REGION);
        })
}

function removeColor() {
    mainChart.selectAll('.event')
        .transition()
        .duration(secondaryDuration)
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
        .attr("id", function(d) { return '_map_' + parseInt(d.id); })
        .attr("d", path);
}

////////////////////////
// CENTERING FUNCTION //
////////////////////////

function center(id) {

    d3.select(id)
        .call(function(d) {

            // calculate map scale and translation
            var bounds = path.bounds(d.datum()),
                dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2,
                scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / mapW, dy / mapH))),
                translate = [mapW / 2 - scale * x, mapH / 2 - scale * y];

            // translate and set new scale for map
            mapG.transition()
                .duration(secondaryDuration)
                .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

        })
}

////////////////////////////
// HIGHLIGHTING FUNCTIONS //
////////////////////////////

function eventHighlight(id) {

    d3.selectAll('.event')
        .transition()
        .duration(secondaryDuration)
        .style('opacity', function(d) {
            if ('#_chart_' + d.ISOCODE !== id) {
                return eventOpacity;
            }
        });
}

function removeHighlight() {
    // d3.selectAll('.event')
    //     .transition()
    //     .duration(secondaryDuration)
    //     .style('opacity', 1)
}

/////////////////////////////
// INTERACTIVITY FUNCTIONS //
/////////////////////////////

function eventMouseOver(d) {

    // color bar
    d3.select(this)
        .classed('event-over', true)

    // prepare text for tooltip
    var pCountry = '<p class="tooltipTextPrimary">' + d.COUNTRY + '</p>',
        pDates = '<p class="tooltipTextSecondary">' + d.STARTYEAR + " - " + d.ENDYEAR + '</p>',
        pCasualties = '<p class="tooltipTextTertiary">' + formatComma(d.AVGFAT) + " casualties" + '</p>';

    // record location for tooltip
    var top = this.getBoundingClientRect().y,
        left = this.getBoundingClientRect().x + (this.getBoundingClientRect().width / 4);

    // add tooltip
    tooltip
        .style("display", "inline-block")
        .html(pCountry + pDates + pCasualties);
}

function eventMouseMove(d) {

    // position tooltip on page
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

    // remove tooltip
    tooltip
        .style('display', 'none')
}

function eventClick(d) {

    // get unique country id
    var mapId = '#_map_' + d.ISOCODE,
        chartId = '#_chart_' + d.ISOCODE;

    // remove any colored countries
    d3.selectAll('.country')
        .classed('country-over', false)

    // color newly selected country
    d3.select(mapId)
        .classed('country-over', true);

    // center map on newly selected country
    center(mapId);

    // change bar coloring
    eventHighlight(chartId);

}

function interaction(conflicts) {

    /////////////////////////////
    // MOUSE EVENTS FOR EVENTS //
    /////////////////////////////

    d3.selectAll('.event')
        .on('mouseover', eventMouseOver)
        .on('mousemove', eventMouseMove)
        .on('mouseout', eventMouseOut)
        .on('click', eventClick);

    /////////////////////////////////
    // MOUSE EVENTS FOR MAIN CHART //
    /////////////////////////////////

    d3.select('#mainChart')
        .on('click', removeHighlight);

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

            //////////////
            // MAP DATA //
            //////////////

            // process world map json data
            var countries = topojson.feature(world, world.objects.countries).features;

            // merge world map data with country names
            countries = countries.filter(function(d) {
                return countryJson.some(function(n) {
                    if (d.id == n['country-code']) return d.name = n.name;
                })
            });

            /////////////////
            // REGION DATA //
            /////////////////

            // get unique region values
            region = conflicts.map(function(obj) { return obj.REGION; });
            region = region.filter(function(v, i) { return region.indexOf(v) == i; });

            console.log(region);

            // color scale
            colorScale = d3.scaleOrdinal()
                .domain(region)
                .range(["#6c71c4", "#b58900",
                    "#dc322f", "#2aa198",
                    "#859900", "#268bd2"
                ]);

            //////////////////////
            // COUNTRY CODE KEY //
            //////////////////////

            // force strings to numbers
            countryCodeKey.forEach(function(d) {
                d.cown = +d.cown
                d.iso3n = +d.iso3n
            })

            ////////////////////
            // CONFLICTS DATA //
            ////////////////////

            conflicts.forEach(function(d) {

                // forcing strings to integers
                d['AVGFAT'] = +(d['AVGFAT'].replace(/,/g, ""));
                d['CIVFATLOW'] = +(d['CIVFATLOW'].replace(/,/g, ""));
                d['CIVFATHIGH'] = +(d['CIVFATHIGH'].replace(/,/g, ""));
                d['COWCCODE'] = +d['COWCCODE'];
                d['STARTYEAR'] = +d['STARTYEAR'];
                d['ENDYEAR'] = +d['ENDYEAR'];

                // assigning iso code to country
                let key = countryCodeKey.find(o => o.cown === d.COWCCODE);
                if (key !== undefined) {
                    d['ISOCODE'] = key.iso3n;
                }

            });

            console.log(conflicts);

            drawPrimaryChart(conflicts);
            orderByDeath();
            drawMap(countries);
            interaction(conflicts);

        }
    });

///////////////////////////
// TESTING REFINE BUTTON //
///////////////////////////

d3.select('.refine-button')
    .on('click', function() {
        console.log('working')
        $header = $(this);
        console.log($header);
        //getting the next element
        $content = $header.next();
        //open up the content needed - toggle the slide- if visible, slide up, if not slidedown.
        $content.slideToggle(500, function() {
            //execute this after slideToggle is done
            //change text of header based on visibility of content div
            $header.text(function() {
                //change text based on condition
                return $content.is(":visible") ? "Collapse" : "Refine";
            });
        });
    })