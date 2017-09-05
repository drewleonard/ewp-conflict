//////////
// TODO //
//////////

// TODAY
// add solarized color to selected bar
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
// Merging functionality (d3.v4)
// functionality when country does not exist?
// height / bar number issue (think this is fixed), but check harding coding still
// STATISTICS
// -- how selected conflict compares to all conflicts
// -- overall trend of conflict in the region relative to total conflict
// -- size of conflict (i.e., duration or deaths) relative to other conflicts in country, region, or totally
// -- -- tree map is a small option
// -- -- better option is waffle chart
// -- -- deaths per year on average
// -- Wars in each region
// -- Ongoing wars per year
// South Sudan has 0 deaths
// Search for a country?
// World View
// Legend text
// Use Google Closure 
// Resizing function still

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var primaryDuration = 1000,
    secondaryDuration = 750;

var eventOpacity = 0.20;

var selectedEvent;

var countries, mapW, mapH, mapG, path, projection;

var formatComma = d3.format(',');

var region, colorScale;

var solarized = [
    "#6c71c4", "#b58900",
    "#dc322f", "#2aa198",
    "#859900", "#268bd2"
];

var chartLegnedText = ["Deaths"];

/////////////////////////////////
// SVG AND OTHER PAGE ELEMENTS //
/////////////////////////////////

var chartMain = d3.select('.chart-main')
    .append('svg')
    .attr('id', 'chartMain');

var legendChart = d3.select('.chart-legend')
    .append('svg')
    .attr('id', 'legendChart');

var map = d3.select('.map')
    .append('svg')
    .attr('id', 'map');

var legendRegionColor = d3.select('.legend-region-color')
    .append('svg')
    .attr('id', 'legendRegionColor');

var legendRegionLabel = d3.select('.legend-region-label')
    .append('svg')
    .attr('id', 'legendRegionLabel');

var tooltip = d3.select('.tooltip');

//////////////////////////////////
// DRAWING PRIMARY CHART LEGEND //
//////////////////////////////////

function drawlegendChartText(textData) {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.chart-legend').css('width')) / (3 / 2),
        h = parseInt($('.chart-legend').css('height'));

    var markerOffset = 20;

    // join data
    var text = legendChart.selectAll('text')
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

function drawlegendChart() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.chart-legend').css('width')) / (3 / 2),
        h = parseInt($('.chart-legend').css('height'));

    legendChart
        .attr('width', w)
        .attr('height', h);

    var markerHeight = 1,
        markerOffset = 20;

    //////////////////
    // ARROW MARKER //
    //////////////////

    var defs = legendChart
        .append('defs');

    defs
        .append('marker')
        .attr('id', 'marker')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 0).attr('refY', 0)
        .attr('markerWidth', w)
        .attr('markerHeight', markerHeight)
        .attr('orient', 'auto')
        .append('path')
        .attr("d", "M0,-5L10,0L0,5");

    ///////////////
    // DRAW LINE //
    ///////////////

    legendChart
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

    drawlegendChartText(["Deaths"]);

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
            d3.max(conflicts, function() { return (new Date()).getFullYear(); })
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
        .ticks(20)
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
        .attr('width', function(d) {
            if (d.ENDYEAR === "ONGOING") {
                return xScale((new Date()).getFullYear()) - xScale(d.STARTYEAR);
            } else {
                if (xScale(d.ENDYEAR) - xScale(d.STARTYEAR) !== 0) {
                    return xScale(d.ENDYEAR) - xScale(d.STARTYEAR);
                } else {
                    return xScale(d.ENDYEAR + 1) - xScale(d.STARTYEAR);
                }
            }

        })
        .attr('height', (h / conflicts.length) * 0.80);

    /////////////////////////////////
    // DRAWING ACCOMPANYING LEGEND //
    /////////////////////////////////

    drawlegendChart();

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

    // WARNING: 127 IS HARD CODED!
    var yScale = d3.scaleLinear()
        .range([20, h])
        .domain([0, 127])

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
    drawlegendChartText(["Deaths"]);

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

    // WARNING: 127 IS HARD CODED!
    var yScale = d3.scaleLinear()
        .range([20, h])
        .domain([0, 127])

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
    drawlegendChartText(["Year"]);

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
        });

}

function removeColor() {

    chartMain.selectAll('.event')
        .transition()
        .duration(secondaryDuration)
        .style('fill', null);

}

//////////////////////////////
// LEGEND DRAWING FUNCTIONS //
//////////////////////////////

function drawLegendRegionColor() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.legend-region-color').css('width')),
        h = parseInt($('.legend-region-color').css('height'));

    var step = w / 2;

    legendRegionColor
        .attr('width', w)
        .attr('height', h);

    ////////////////////////////
    // DRAWING LEGEND SQAURES //
    ////////////////////////////

    legendRegionColor.selectAll('.square')
        .data(solarized)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', function(d, i) {
            return step + (i * w * 2)
        })
        .attr('width', w)
        .attr('height', w)
        .attr('fill', function(d) {
            return d;
        });

}

function drawLegendRegionLabel() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.legend-region-label').css('width')),
        h = parseInt($('.legend-region-label').css('height')),
        squareW = parseInt($('.legend-region-color').css('width'));

    var step = squareW / 2;

    legendRegionLabel
        .attr('width', w)
        .attr('height', h);

    ///////////////////////////
    // DRAWING LEGEND LABELS //
    ///////////////////////////

    legendRegionLabel.selectAll('.label')
        .data(region)
        .enter()
        .append('text')
        .attr('x', 0)
        .attr('y', function(d, i) {
            return step + squareW + (i * squareW * 2)
        })
        .text(function(d) {
            return d;
        })

}

function drawLegendRegion() {
    drawLegendRegionColor();
    drawLegendRegionLabel();
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

////////////////////
// RESET FUNCTION //
////////////////////

function mapReset() {

    d3.selectAll('.country')
        .classed('country-over', false);

    mapG.transition()
        .duration(secondaryDuration)
        .attr("transform", "");

}

////////////////////////////
// HIGHLIGHTING FUNCTIONS //
////////////////////////////

function eventAddHighlight(id) {

    d3.selectAll('.event')
        .transition()
        .duration(secondaryDuration)
        .style('opacity', function(d) {
            if ('#_chart_' + d.ISOCODE !== id) {
                return eventOpacity;
            }
        });
}

function eventRemoveHighlight() {

    d3.selectAll('.event')
        .transition()
        .duration(secondaryDuration)
        .style('opacity', null);

    d3.selectAll('.event')
        .classed('event-over', false);

    $('.information-country').hide();

    $('.information-primary').show();

    mapReset();

}

////////////////////////
// ADDING INFORMATION //
////////////////////////

function addInformation(d) {

    // filermoving primary information
    $('.information-primary').hide();

    // updating information
    d3.select('.information-country-country')
        .html(d.COUNTRY);

    d3.select('.information-country-shortdescription')
        .html(d.SHORTDESCRIPTION);

    d3.select('.information-country-year-value')
        .html(d.STARTYEAR + ' - ' + d.ENDYEAR);

    d3.select('.information-country-death-value')
        .html(formatComma(d.AVGFAT));

    d3.select('.information-country-region-value')
        .html(function() {
            if (d.REGION.includes("and")) {
                var arr = d.REGION.split('and');
                return arr[0] + ' and' + '</br>' + arr[1];
            } else {
                return d.REGION
            }

        });

    // adding information
    $('.information-country').show();

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
            if (d3.event.pageY - ($(this).height() * (3 / 2)) > 0) {
                return d3.event.pageY - ($(this).height() * (3 / 2)) + "px";
            } else {
                return d3.event.pageY + ($(this).height() * (1 / 3)) + "px";
            }

        })
        .style('left', function() {
            if (d3.event.pageX + ($(this).width()) < $('body').width()) {
                return d3.event.pageX + "px";
            } else {
                return d3.event.pageX - ($(this).width()) - 10 + "px";
            }

        });
}

function eventMouseOut(d) {

    // remove bar color if event is not selected by eventClick()
    if (this !== selectedEvent) {
        d3.select(this)
            .classed('event-over', false)
    }

    // remove tooltip
    tooltip
        .style('display', 'none')
}

function eventClick(d) {

    // record selected event
    selectedEvent = this;

    // get unique country id
    var mapId = '#_map_' + d.ISOCODE,
        chartId = '#_chart_' + d.ISOCODE;

    // remove any colored countries
    d3.selectAll('.country')
        .classed('country-over', false);


    try {

        // color newly selected country
        d3.select(mapId)
            .classed('country-over', true);

        // center map on newly selected country
        center(mapId);

    } catch (TypeError) {

        console.log(TypeError + ': problem drawing map');

    }

    // remove any colored bars
    d3.selectAll('.event')
        .classed('event-over', false);

    // color newly selected event
    d3.select(this)
        .classed('event-over', true);

    // change bar coloring
    eventAddHighlight(chartId);

    // changing information div
    addInformation(d);

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
        .on('click', refineToggle);

    d3.selectAll('.refine-order')
        .on('click', refineOrderClick);

    ///////////////////
    // LEGEND BUTTON //
    ///////////////////

    d3.select('.legend-button')
        .on('click', legendToggle);

    /////////////////////
    // CHART SELECTION //
    /////////////////////

    document.getElementById('chart-main').onclick = function(e) {
        if (!e.target.hasAttribute('class', 'event')) {
            eventRemoveHighlight();
        }
    }

}

//////////////////////
// REFINE FUNCTIONS //
//////////////////////

function refineToggle() {

    // toggle refine selector up or down
    $('.refine-selector').slideToggle();
}

function refineOrderClick() {

    d3.select(this.parentNode).selectAll('.refine-order')
        .classed('label-selected', false)

    d3.select(this)
        .classed('label-selected', true)
}

//////////////////////
// LEGEND FUNCTIONS //
//////////////////////

function legendToggle() {

    // toggle legend up or down
    $('.legend-selector').slideToggle();

    // draw legend
    drawLegendRegion();
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
            countries = topojson.feature(world, world.objects.countries).features;

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

            // color scale
            colorScale = d3.scaleOrdinal()
                .domain(region)
                .range(solarized);

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

                if (d['ENDYEAR'] !== "ONGOING") {
                    d['ENDYEAR'] = +d['ENDYEAR'];
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