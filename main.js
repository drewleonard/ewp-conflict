//////////
// TODO //
//////////

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
            console.log(conflicts)
        }
    })