// map component
var theMap = (function() {

	// get base map tiles
	var mapboxTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
    });

	// realize those tiles
	var map = L.map('map')
    	.addLayer(mapboxTiles)
    	.setView([37.763536, -122.446698], 16);

   	// define svg, hide phantom artifacts on zoom
	var svg = d3.select(map.getPanes().overlayPane).append("svg"),
	g = svg.append("g").attr("class", "leaflet-zoom-hide");

	// Asynch load of 100% GPS Verified DATAS
	d3.json("data/SF_weekday_total.json", function(collection) {

		console.log("c", collection); // note data structure

		var nest = d3.nest()
  			.key(function(d, i) {
    			return d.properties.ID;
  			})
  			.entries(collection.features);

		console.log("data", nest);

		// get value from menu selection
    	// the option values are set in HTML and correspond
    	// to the [Statistic] value used to nest the data  
    	var series = menu.property("value");
    
    	// only retrieve data from the selected series, using the nest we just created
    	var data = nest[series];







  		// create Min, Max, Median, Mean variables for WEEKDAY ACTIVITY COUNTY
  		var Weekday_ActCount_Min = d3.min(data, function(d) { return d.properties.weekday_ACTCNT; });
      	var Weekday_ActCount_Max = d3.max(data, function(d) { return d.properties.weekday_ACTCNT; });
      	var Weekday_ActCount_Median = d3.median(data, function(d) { return d.properties.weekday_ACTCNT; });
      	var Weekday_ActCount_Mean = d3.mean(data, function(d) { return d.properties.weekday_ACTCNT; });

      	console.log("min", Weekday_ActCount_Min);
      	console.log("max", Weekday_ActCount_Max);
      	console.log("median", Weekday_ActCount_Median);
      	console.log("mean", Weekday_ActCount_Mean);
      	
      	// create color function to relay min (blue), median (white), max (red) values
      	var color = d3.scale.linear()
    		.domain([Weekday_ActCount_Min, Weekday_ActCount_Median, Weekday_ActCount_Max])
    		.range(["#2166ac", "#f7f7f7", "#b2182b"]);

    	var weightScale = d3.scale.linear()
    		.domain(d3.extent(collection.features, function(d) { return d.properties.weekday_ACTCNT; })).range([0.5, 5]);

		// project points, convert geojson to svg
		var transform = d3.geo.transform({point: projectPoint}),
			path = d3.geo.path().projection(transform);

		// create empty path elements for each of the features
		var feature = g.selectAll("path")
			.data(collection.features)
			.enter().append("path");

		// reset map view on zoom
		map.on("viewreset", reset);
		// call reset function to realize data paths
		reset();

		
		// define reset function
		function reset() {

		// compute projected bounding box
		var bounds = path.bounds(collection),
			topLeft = bounds[0],
			bottomRight = bounds[1];

		// set SVG dimensions w/ padding to display features
		// above or to the left of the origin
		svg	.attr("width", bottomRight[0] - topLeft[0])
			.attr("height", bottomRight[1] - topLeft[1])
			.style("left", topLeft[0] + "px")
			.style("top", topLeft[1] + "px");

		g 	.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

		// initialize path data by setting d attribute
		feature.attr("d", path)
				.style("stroke-width", function(d) {return weightScale(d.properties.weekday_ACTCNT);
			})
				.attr("stroke", function (d) {
    			return color(d.properties.weekday_ACTCNT);
			});

	}

		// adapts Leaflet's latLngToLayerPoint and LatLng methods
		// to project a single point; resulting coordinates are
		// passed to an output geometry stream
		function projectPoint(x,y) {
			var point = map.latLngToLayerPoint(new L.LatLng(y,x));
			this.stream.point(point.x, point.y);
		}


	});

return theMap;

}());



