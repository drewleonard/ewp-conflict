//////////
// TODO //
//////////

// TODAY
// add regionPalette color to selected bar
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
// -- -- tree map is a small option #586e75
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
// defaultPalette / find way of getting css

//////////////////////
// GLOBAL VARIABLES //
//////////////////////

var primaryDuration = 1000,
    secondaryDuration = 750;

var eventOpacity = 0.20;

var selectedEvent;

var countries, mapW, mapH, mapG, path, projection, zoom;

var formatComma = d3.format(',');

var region, regionColorScale;

var deathColorScaleDomain, deathColorScale;

var regionPalette = [
    "#6c71c4", "#b58900",
    "#dc322f", "#2aa198",
    "#859900", "#268bd2"
];

var deathPalette = ["#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"]
// ["#081d58", "#253494", "#225ea8", "#1d91c0", "#41b6c4", "#7fcdbb", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"]

var defaultPalette = ["#586e75"],
    defaultLegend = ["All events"];

var selectedPalette = ["#268bd2", "#586e75"],
    selectedLegend = ["Selected event", "Other events in country"];

var chartLegendText = ["Deaths"];

var filledByRegion = false,
    eventSelected = false;

var legendCases = {
    default: function() {
        $('.legend-region').slideUp();
        $('.legend-default').slideDown();
        $('.legend-selected').slideUp();
    },
    selected: function() {
        $('.legend-region').slideUp();
        $('.legend-default').slideUp();
        $('.legend-selected').slideDown();
    },
    region: function() {
        $('.legend-region').slideDown();
        $('.legend-default').slideUp();
        $('.legend-selected').slideUp();
    }
}

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

var legendDefaultColor = d3.select('.legend-default-color')
    .append('svg')
    .attr('id', 'legendDefaultColor');

var legendDefaultLabel = d3.select('.legend-default-label')
    .append('svg')
    .attr('id', 'legendDefaultLabel');

var legendSelectedLabel = d3.select('.legend-selected-label')
    .append('svg')
    .attr('id', 'legendSelectedLabel');

var legendSelectedColor = d3.select('.legend-selected-color')
    .append('svg')
    .attr('id', 'legendSelectedColor');

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

    chartLegendText = ["Deaths"];
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

    chartLegendText = ["Year"];
    drawlegendChartText(["Year"]);

}

////////////////////////
// COLORING FUNCTIONS //
////////////////////////

function colorByRegion() {

    // legend settings
    filledByRegion = true;
    legendCases.region();

    // set each event fill by country
    chartMain.selectAll('.event')
        .transition()
        .duration(secondaryDuration)
        .style('fill', function(d) {
            return regionColorScale(d.REGION);
        });

}

function colorByDeath() {

    // legend settings

    chartMain.selectAll('.event')
        .transition()
        .duration(secondaryDuration)
        .style('fill', function(d) {
            return deathColorScale(d.AVGFAT)
        });

}

function removeColor() {

    // legend settings
    filledByRegion = false;

    if (eventSelected === false) {
        legendCases.default();
    } else {
        legendCases.selected();
    }


    chartMain.selectAll('.event')
        .transition()
        .duration(secondaryDuration)
        .style('fill', null);

}

//////////////////////////////
// LEGEND DEFAULT FUNCTIONS //
//////////////////////////////

function drawLegendDefaultColor() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.legend-default-color').css('width')),
        h = parseInt($('.legend-default-color').css('height'));

    legendDefaultColor
        .attr('width', w)
        .attr('height', h)

    //////////////////////////
    // STEP AND POSITIONING //
    //////////////////////////

    var numBoxes = defaultPalette.length,
        numSpaces = numBoxes - 1,
        boxesH = w * (numBoxes + numSpaces),
        step = (h - boxesH) / 2;

    ////////////////////////////
    // DRAWING LEGEND SQAURES //
    ////////////////////////////

    legendDefaultColor.selectAll('.square')
        .data(defaultPalette)
        .enter()
        .append('rect')
        .attr('class', 'square')
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

function drawLegendDefaultLabel() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.legend').css('width')),
        h = parseInt($('.legend-default-label').css('height')),
        squareW = parseInt($('.legend-default-color').css('width'));

    legendDefaultLabel
        .attr('width', w)
        .attr('height', h);

    //////////////////////////
    // STEP AND POSITIONING //
    //////////////////////////

    var numBoxes = defaultLegend.length,
        numSpaces = numBoxes - 1,
        boxesH = squareW * (numBoxes + numSpaces),
        step = (h - boxesH) / 2;

    ///////////////////////////
    // DRAWING LEGEND LABELS //
    ///////////////////////////

    legendDefaultLabel.selectAll('.label')
        .data(defaultLegend)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', 0)
        .attr('y', function(d, i) {
            return step + squareW + (i * squareW * 2)
        })
        .text(function(d) {
            return d;
        })
}

///////////////////////////////
// LEGEND SELECTED FUNCTIONS //
///////////////////////////////

function drawLegendSelectedColor() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.legend-selected-color').css('width')),
        h = parseInt($('.legend-selected-color').css('height'));

    legendSelectedColor
        .attr('width', w)
        .attr('height', h);

    //////////////////////////
    // STEP AND POSITIONING //
    //////////////////////////

    var numBoxes = selectedPalette.length,
        numSpaces = numBoxes - 1,
        boxesH = w * (numBoxes + numSpaces),
        step = (h - boxesH) / 2;

    ////////////////////////////
    // DRAWING LEGEND SQAURES //
    ////////////////////////////

    legendSelectedColor.selectAll('.square')
        .data(selectedPalette)
        .enter()
        .append('rect')
        .attr('class', 'square')
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

function drawLegendSelectedLabel() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.legend').css('width')),
        h = parseInt($('.legend-selected-label').css('height')),
        squareW = parseInt($('.legend-selected-color').css('width'));

    legendSelectedLabel
        .attr('width', w)
        .attr('height', h);

    //////////////////////////
    // STEP AND POSITIONING //
    //////////////////////////

    var numBoxes = selectedLegend.length,
        numSpaces = numBoxes - 1,
        boxesH = squareW * (numBoxes + numSpaces),
        step = (h - boxesH) / 2;

    ///////////////////////////
    // DRAWING LEGEND LABELS //
    ///////////////////////////

    legendSelectedLabel.selectAll('.label')
        .data(selectedLegend)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', 0)
        .attr('y', function(d, i) {
            return step + squareW + (i * squareW * 2)
        })
        .text(function(d) {
            return d;
        })
}

/////////////////////////////
// LEGEND REGION FUNCTIONS //
/////////////////////////////

function drawLegendRegionColor() {

    ////////////////
    // DIMENSIONS //
    ////////////////

    var w = parseInt($('.legend-region-color').css('width')),
        h = parseInt($('.legend-region-color').css('height'));

    legendRegionColor
        .attr('width', w)
        .attr('height', h);

    //////////////////////////
    // STEP AND POSITIONING //
    //////////////////////////

    var numBoxes = regionPalette.length,
        numSpaces = numBoxes - 1,
        boxesH = w * (numBoxes + numSpaces),
        step = (h - boxesH) / 2;

    ////////////////////////////
    // DRAWING LEGEND SQAURES //
    ////////////////////////////

    legendRegionColor.selectAll('.square')
        .data(regionPalette)
        .enter()
        .append('rect')
        .attr('class', 'square')
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

    var w = parseInt($('.legend').css('width')),
        h = parseInt($('.legend-region-label').css('height')),
        squareW = parseInt($('.legend-region-color').css('width'));

    legendRegionLabel
        .attr('width', w)
        .attr('height', h);

    //////////////////////////
    // STEP AND POSITIONING //
    //////////////////////////

    var numBoxes = region.length,
        numSpaces = numBoxes - 1,
        boxesH = squareW * (numBoxes + numSpaces),
        step = (h - boxesH) / 2;

    ///////////////////////////
    // DRAWING LEGEND LABELS //
    ///////////////////////////

    legendRegionLabel.selectAll('.label')
        .data(region)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', 0)
        .attr('y', function(d, i) {
            return step + squareW + (i * squareW * 2)
        })
        .text(function(d) {
            return d;
        })
}

function drawLegend() {
    drawLegendDefaultColor();
    drawLegendDefaultLabel();
    drawLegendSelectedColor();
    drawLegendSelectedLabel();
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

    map.append("rect")
        .attr("class", "map-background")
        .attr("width", mapW)
        .attr("height", mapH)
        .on("click", mapReset);

    mapG = map.append('g');

    ////////////
    // SCALES //
    ////////////

    projection = d3.geoMercator()
        .scale(mapW / 2 / Math.PI)
        .translate([mapW / 2, mapH / 2]);

    path = d3.geoPath().projection(projection);

    zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    map.call(zoom);

    /////////////////
    // DRAWING MAP //
    /////////////////

    mapG.selectAll(".country")
        .data(countries)
        .enter()
        .insert("path", ".graticule")
        .attr("class", "country")
        .attr("id", function(d) { return '_map_' + parseInt(d.id); })
        .attr("d", path)
        .on('click', countryClickZoom);
}

///////////////////////////////////
// MAP ZOOM AND CENTER FUNCTIONS //
///////////////////////////////////

function eventClickZoom(id) {

    // remove any filled countries
    d3.selectAll('.country')
        .classed('country-over', false);

    // color newly selected country
    d3.select(id)
        .classed('country-over', true);

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
            map.transition()
                .duration(primaryDuration)
                .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

        })
}

function countryClickZoom(d) {

    // remove any filled countries
    d3.selectAll('.country')
        .classed('country-over', false);

    // color newly selected country
    d3.select(this)
        .classed('country-over', true);

    // remove any filled events
    d3.selectAll('.event')
        .classed('event-over', false);


    // finding events of selected country
    var arr = conflicts.filter(function(e) {
        return e.ISOCODE === Number(d.id);
    });

    if (arr.length > 0) {

        var description = 'This country has ' + '<span class="information-country-click-emphasis">' + arr.length + '</span>' +
            ' episode(s) of political repression since 1945. ' +
            'Episodes are highlighted to the right.'

        d3.selectAll('.event')
            .transition()
            .duration(secondaryDuration)
            .style('opacity', function(d) {

                function findCountry(id) {
                    return arr.some(function(el) {
                        return el.ISOCODE === id;
                    });
                }

                if (findCountry(d.ISOCODE) !== true) {
                    return eventOpacity;
                }
            });

    } else {

        var description = 'This country has ' + '<span class="information-country-click-emphasis">' + arr.length + '</span>' +
            ' episodes of political repression since 1945.'

        d3.selectAll('.event')
            .transition()
            .duration(secondaryDuration)
            .style('opacity', eventOpacity);

    }

    /////////////////////////
    // SIDEBAR INFORMATION //
    /////////////////////////

    // add initial information to sidebar
    d3.select('.information-country-click-country')
        .html(d.name);

    d3.select('.information-country-click-instructions')
        .html(description);

    var targetDiv = $('.information-country-click');
    resetInformation(targetDiv);

    ////////////////////////
    // MAP TRANSFORMATION //
    ////////////////////////

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / mapW, dy / mapH))),
        translate = [mapW / 2 - scale * x, mapH / 2 - scale * y];

    map.transition()
        .duration(primaryDuration)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

}

function zoomed() {

    var transform = d3.event.transform;

    transform.x = d3.min([transform.x, 0]);
    transform.y = d3.min([transform.y, 0]);
    transform.x = d3.max([transform.x, (1 - transform.k) * mapW]);
    transform.y = d3.max([transform.y, (1 - transform.k) * mapH]);

    mapG.attr("transform", transform);

}

////////////////////
// RESET FUNCTION //
////////////////////

function resetInformation(targetDiv) {

    $('.information').children('.information-child').each(function() {
        $(this).hide();
    });

    targetDiv.show();
}

function mapReset() {

    d3.selectAll('.country')
        .classed('country-over', false);

    d3.selectAll('.event')
        .transition()
        .duration(primaryDuration)
        .style('opacity', null);

    d3.selectAll('.event')
        .classed('event-over', false);

    var targetDiv = $('.information-primary');
    resetInformation(targetDiv);

    map.transition()
        .duration(primaryDuration)
        .call(zoom.transform, d3.zoomIdentity);

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

    var targetDiv = $('.information-primary');
    resetInformation(targetDiv);

    mapReset();

}

////////////////////////
// ADDING INFORMATION //
////////////////////////

function addInformation(d) {

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

    d3.select('.information-country-note-value')
        .html(d.LONGDESCRIPTION);

    var targetDiv = $('.information-country');
    resetInformation(targetDiv);

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
        pDeaths = '<p class="tooltipTextTertiary">' + formatComma(d.AVGFAT) + " deaths" + '</p>';

    // record location for tooltip
    var top = this.getBoundingClientRect().y,
        left = this.getBoundingClientRect().x + (this.getBoundingClientRect().width / 4);

    // add tooltip
    tooltip
        .style("display", "inline-block")
        .html(pCountry + pDates + pDeaths);
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

    // legend settings
    eventSelected = true;
    if (filledByRegion === false) {
        legendCases.selected();
    }

    // record selected event
    selectedEvent = this;

    // get unique country id
    var mapId = '#_map_' + d.ISOCODE,
        chartId = '#_chart_' + d.ISOCODE;

    try {

        // center map on newly selected country
        eventClickZoom(mapId);

    } catch (TypeError) {

        // reset map if country does not exist on map
        map.transition()
            .duration(primaryDuration)
            .call(zoom.transform, d3.zoomIdentity);

    }

    // remove any filled bars
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

    ////////////////////
    // DETAILS BUTTON //
    ////////////////////

    d3.select('#details-arrow')
        .on('click', detailsArrowToggle);

    ///////////////////
    // REFINE BUTTON //
    ///////////////////

    d3.select('#refine-arrow')
        .on('click', refineToggle);

    d3.selectAll('.refine-order')
        .on('click', refineOrderClick);

    ///////////////////
    // LEGEND BUTTON //
    ///////////////////

    d3.select('#legend-arrow')
        .on('click', legendToggle);

    /////////////////////
    // CHART SELECTION //
    /////////////////////

    document.getElementById('chart-main').onclick = function(e) {
        if (!e.target.hasAttribute('class', 'event')) {

            // toggling legend
            eventSelected = false;

            if (filledByRegion === false) {
                legendCases.default();
            } else {
                legendCases.region();
            }

            eventRemoveHighlight();
        }
    }

}

///////////////////////
// DETAILS FUNCTIONS //
///////////////////////

function detailsArrowToggle() {
    // toggle long description
    $('.information-country-note-value').slideToggle();
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
    $('.legend-wrapper').slideToggle();

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
    .await(function(error, conflictsProcessed, countryCodeKey, world, countryJson) {

        if (error) {

            throw error

        } else {

            // Data processing tasks we want to do once only


            ////////////////////
            // WORLD MAP DATA //
            ////////////////////

            countries = topojson.feature(world, world.objects.countries).features;

            /////////////////
            // REGION DATA //
            /////////////////

            // get unique region values
            region = conflictsProcessed.map(function(obj) { return obj.REGION; });
            region = region.filter(function(v, i) { return region.indexOf(v) == i; });

            // region color scale
            regionColorScale = d3.scaleOrdinal()
                .domain(region)
                .range(regionPalette);

            ////////////////
            // DEATH DATA //
            ////////////////

            deathColorScaleDomain = function() {

                var tempArr = conflictsProcessed
                    .map(function(o) { return o.AVGFAT; })
                    .filter(Boolean)
                    .sort(function(a, b) { return d3.ascending(a, b); });

                var q1 = d3.quantile(tempArr, 0.20),
                    q2 = d3.quantile(tempArr, 0.40),
                    q3 = d3.quantile(tempArr, 0.60),
                    q4 = d3.quantile(tempArr, 0.80),
                    q5 = d3.quantile(tempArr, 1.00);

                return [q1, q2, q3, q4, q5];

            }

            deathColorScale = d3.scaleQuantile()
                .domain(deathColorScaleDomain())
                .range(deathPalette);

            //////////////////////
            // COUNTRY CODE KEY //
            //////////////////////

            // force strings to numbers
            countryCodeKey.forEach(function(d) {
                d.cown = +d.cown
                d.iso3n = +d.iso3n
            });

            ////////////////////
            // CONFLICTS DATA //
            ////////////////////

            conflictsProcessed.forEach(function(d) {

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

            ////////////////////////////////////////////////////
            // MERGING COUNTRY NAMES WITH PROCESSED CONFLICTS //
            ////////////////////////////////////////////////////

            countryJson.forEach(function(d) {

                var arr = conflictsProcessed.filter(function(e) {
                    return e.ISOCODE === Number(d['country-code']);
                });
                if (arr.length > 0) {
                    d.name = arr[0].COUNTRY;
                }
            })


            countries = countries.filter(function(d) {
                return countryJson.some(function(n) {
                    if (d.id === n['country-code']) return d.name = n.name;
                })
            });

            ////////////////////////////////////////////
            // GLOBAL VARIABLE FOR PROCSSED CONFLICTS //
            ////////////////////////////////////////////

            conflicts = conflictsProcessed;

            drawPrimaryChart(conflictsProcessed);
            orderByDeath();
            drawMap(countries);
            drawLegend();
            interaction(conflictsProcessed);

        }
    });