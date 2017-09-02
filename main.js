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
// SIDE BAR ON LEFT
// Legend for order of bars
// Change radio button hard coding
// Resizing function
// Merging functionality (d3.v4)
// functionality when country does not exist?
// height / bar number issue (think this is fixed), but check harding coding still
// STATISTICS
// -- how selected conflict compares to all conflicts
// -- overall trend of conflict in the region relative to total conflict

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var primaryDuration = 1000,
    secondaryDuration = 750;

var eventOpacity = 0.30;

var mapW, mapH, mapG, path, projection;

var formatComma = d3.format(',');

var region, colorScale;

var chartLegnedText = ["Deaths"];

///////////////////
// PAGE ELEMENTS //
///////////////////

var chartMain = d3.select('.chart-main')
    .append('svg')
    .attr('id', 'chartMain');

var chartLegend = d3.select('.chart-legend')
    .append('svg')
    .attr('id', 'chartLegend');

var map = d3.select('.map')
    .append('svg')
    .attr('id', 'map');

var tooltip = d3.select('.tooltip');

//////////////////////////////////
// DRAWING PRIMARY CHART LEGEND //
//////////////////////////////////

function drawChartLegendText(textData) {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.chart-legend').css('width')) / (3 / 2),
        h = parseInt($('.chart-legend').css('height'));

    var markerOffset = 20;

    // join data
    var text = chartLegend.selectAll('text')
        .data(textData, function(d) { return d; });

    // exit old elements in data
    text.exit()
        .remove();

    // update data
    text
        .attr('x', function() {
            return -(this.getComputedTextLength() + markerOffset)
        });

    // enter new elements in data
    text.enter()
        .append('text')
        .attr('class', 'chart-legend-text')
        .text(function(d) { return d; })
        .attr('x', function() {
            return -(this.getComputedTextLength() + markerOffset)
        })
        .attr('y', w / 2)
        .attr('dy', '.35em')
        .attr("transform", function(d) {
            return "rotate(-90)"
        });
}

function drawChartLegend() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.chart-legend').css('width')) / (3 / 2),
        h = parseInt($('.chart-legend').css('height'));

    chartLegend
        .attr('width', w)
        .attr('height', h);

    var markerHeight = 1,
        markerOffset = 20;

    //////////////////
    // ARROW MARKER //
    //////////////////

    var defs = chartLegend
        .append('defs');

    defs
        .append('marker')
        .attr('id', 'marker')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('markerWidth', w)
        .attr('markerHeight', markerHeight)
        .attr('orient', 'auto')
        .append('path')
        .attr("d", "M0,-5L10,0L0,5");

    ///////////////
    // DRAW LINE //
    ///////////////

    chartLegend
        .append('line')
        .attr('class', 'marker')
        .attr('marker-end', 'url(#marker)')
        .attr('x1', w / 2)
        .attr('x2', w / 2)
        .attr('y1', h)
        .attr('y2', markerOffset)

    ///////////////
    // DRAW TEXT //
    ///////////////

    drawChartLegendText(["Deaths"]);

}

///////////////////////////
// DRAWING PRIMARY CHART //
///////////////////////////

function drawPrimaryChart(conflicts) {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.chart-main').css('width')),
        h = parseInt($('.chart-main').css('height'));

    chartMain
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

    chartMain.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,25)')
        .call(xAxis);

    d3.select('.axis').selectAll('text')
        .attr("transform", "translate( 0, " + -h + ") ");

    ///////////////////////////
    // ADDING EVENT ELEMENTS //
    ///////////////////////////

    var event = chartMain.selectAll('.event')
        .data(conflicts)
        .enter()
        .append('rect')
        .attr('class', 'event')
        .attr('id', function(d) { return d.ISOCODE; })
        .attr('x', function(d) { return xScale(d.STARTYEAR); })
        .attr('y', function(d, i) { return yScale(i); })
        .attr('width', function(d) { return xScale(d.ENDYEAR) - xScale(d.STARTYEAR); })
        .attr('height', (h / conflicts.length) * 0.80);

    /////////////////////////////////
    // DRAWING ACCOMPANYING LEGEND //
    /////////////////////////////////

    drawChartLegend();

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

    chartMain.selectAll('.event')
        .sort(function(a, b) {
            return d3.descending(+a.AVGFAT, +b.AVGFAT);
        })
        .transition()
        .duration(1000)
        .attr('y', function(d, i) {
            return yScale(i);
        });

    chartLegnedText = ["Deaths"];
    drawChartLegendText(["Deaths"]);

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

    chartMain.selectAll('.event')
        .sort(function(a, b) {
            return d3.descending(a["STARTYEAR"], b["STARTYEAR"])
        })
        .transition()
        .duration(primaryDuration)
        .attr('y', function(d, i) {
            return yScale(i);
        });

    chartLegnedText = ["Year"];
    drawChartLegendText(["Year"]);
    // chartLegend.selectAll('text').text("Year")

}

////////////////////////
// COLORING FUNCTIONS //
////////////////////////

function colorByRegion() {

    chartMain.selectAll('.event')
        .transition()
        .duration(secondaryDuration)
        .style('fill', function(d) {
            return colorScale(d.REGION);
        })
}

function removeColor() {
    chartMain.selectAll('.event')
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

//////////////////////
// REFINE FUNCTIONS //
//////////////////////

function refineToggle() {
    $('.refine-selector').slideToggle();
}

function refineOrderClick() {

    d3.select(this.parentNode).selectAll('.refine-order')
        .classed('label-selected', false)

    d3.select(this)
        .classed('label-selected', true)
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

    ///////////////////
    // REFINE BUTTON //
    ///////////////////

    d3.select('.refine-button')
        .on('click', refineToggle)

    d3.selectAll('.refine-order')
        .on('click', refineOrderClick);

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