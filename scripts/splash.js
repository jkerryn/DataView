var Tilesplash = require('tilesplash');

var app = new Tilesplash('postgres://jonathanknelson@localhost/ts_db');

app.layer('test_layer', function(req, res, tile, done){
  done(null, 'SELECT ST_AsGeoJSON(geom) as the_geom_geojson FROM edges WHERE ST_Intersects(geom, !bbox_4326!)');
});

app.server.listen(3000);