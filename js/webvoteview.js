function webVoteView(options) {
  // This is the main file
  //  - It loads the neccesary data
  //  - Hold common functions
  //  - Calls the widgets
  //  - Connect both charts (to be done)

  var defaults = {
    showDescription: true,
    chamber: 'H',
    session: 89,
    rcnum: 2
  }

  // Compose Settings Object
  var settings = $.extend(defaults, options);

  // Initialise
  init();

  // Main function
  function init() {
    loadData(settings.chamber, parseInt(settings.session), parseInt(settings.rcnum));
  };

  // AJAX calls to load data
  function loadData(chamber, session, rcnum) {
    queue()
      .defer(d3.json, sprintf("json/districts%03d.json", session))
      .defer(d3.json, sprintf("json/states%03d.json", session))
      .defer(d3.json,sprintf("../voteview/getvote?id=%s%03d%04d", chamber, session, rcnum))
      .defer(d3.json,sprintf("../voteview/getmemberslist?session=%d", session))
      // .defer(d3.json,sprintf("../voteview/getvote/%s%03d%04d", chamber, session, rcnum))
      // .defer(d3.json,sprintf("../voteview/getmemberslist/%d", session))
      .await(drawWidgets);
  }

  // Call the map and scatterplot widgets
  function drawWidgets(error, districts, states, votation, members) {
    if (error) return console.error("Error: ", error);
    if (settings.showDescription) setDescription(votation);
    if (settings.map != undefined) {
      var mapChart = new webVoteMap("#map", {
                                            'districts': districts, 
                                            'states': states,
                                            'votation': votation,
                                            'members': members
                                          },
                                          {
                                            'height': 200,
                                            'width': 500
                                          }
                                          );
    }
    if (settings.scatter != undefined) {
      var scatterChart = new webVoteScatter("#scatter", {
                                            'districts': districts, 
                                            'states': states,
                                            'votation': votation,
                                            'members': members
                                          });
    }
  }

  // Write to the description ids the name, description and date of the votation
  function setDescription(vote) {
      d3.select("#wvv-rollcall").html(sprintf("Chamber %s/Congress %d/Rollcall %d", 
                                               vote['chamber'],vote['session'],vote['rollnumber']));
      d3.select("#wvv-description").html(vote['description']);
      d3.select("#wvv-date").html(vote['date']);
  }

  // Blend an array of colors
  function blendColors(colors) {
    var r = 0, g = 0 , b = 0;
    for (var i=0; i<colors.length; i++){
      r = r + colors[i].r;
      g = g + colors[i].g;
      b = b + colors[i].b; 
    }
    r = r / colors.length;
    g = g / colors.length;
    b = b / colors.length;
    return d3.rgb(r,g,b);
  }

}