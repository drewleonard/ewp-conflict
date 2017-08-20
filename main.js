//////////
// TODO //
//////////

////////////////
// DIMENSIONS //
////////////////

var w = parseInt($('.chart-main').css('width')),
    h = parseInt($('.chart-main').css('height'));

//////////////////
// CREATING SVG //
//////////////////




/////////////////
// NAMING DATA //
/////////////////

conflicts = "ewp-conflicts-data.csv"

//////////////////
// LOADING DATA //
//////////////////

d3.queue()
    .defer(d3.csv, conflicts)
    .await(function(error, conflicts) {
        if (error) {
            throw error
        } else {



        }
    })