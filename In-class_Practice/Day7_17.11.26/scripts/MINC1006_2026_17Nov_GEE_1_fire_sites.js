// =====================================================================
// M.INC 1006, 17 November 2026
// Script 1: Landsat NDVI and NBR for the post-fire field sites
//
// Result: a table with one row per site and year, which you join to
// the field data in R, and one GeoTIFF for QGIS.
//
// Workflow: FIND, FILTER, MASK, COMPUTE, COMPOSITE, CHECK, EXPORT
// Before you run it, upload the sites as a table:
//   Assets tab > NEW > CSV file (.csv) > MINC1006_fire_sites_for_GEE.csv
//   Name it MINC1006_fire_sites, and press UPLOAD.
// Wait until the upload has finished in the Tasks tab, then replace
// YOUR-PROJECT-ID below with your own Cloud project.
// =====================================================================


// ---------------------------------------------------------------------
// 0. SETTINGS: change these, and leave the rest until you understand it
// ---------------------------------------------------------------------

var assetPath = 'projects/YOUR-PROJECT-ID/assets/MINC1006_fire_sites';

var startYear = 1990;      // first year of the time series
var endYear = 2020;        // last year of the time series
var startMonth = 7;        // July: the same season in every year
var endMonth = 8;          // August

var bufferMetres = 45;     // radius around each site, about 3 x 3 pixels
var exampleSite = 'Fox1998-1';   // site shown in the chart
var exampleFire = 'FoxLake1998'; // fire exported as a GeoTIFF
var exampleYear = 2005;    // year shown on the map and exported
var exampleCrs = 'EPSG:32608';   // UTM zone 8N, suits the Fox Lake fire


// ---------------------------------------------------------------------
// 1. FIND: the data and the bands
// ---------------------------------------------------------------------

// The field sites you uploaded.
var sites = ee.FeatureCollection(assetPath);
print('Number of sites:', sites.size());

// The same colour has a different band number on different sensors,
// so we give the bands one set of names.
var bandsLandsat5and7 = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'];
var bandsLandsat8and9 = ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'];
var commonNames = ['blue', 'green', 'red', 'nir', 'swir1', 'swir2'];


// ---------------------------------------------------------------------
// 2. FILTER: keep only what you need, before any processing
// ---------------------------------------------------------------------

var filterLandsat = function(collectionId) {
  return ee.ImageCollection(collectionId)
    .filterBounds(sites)
    .filterDate(startYear + '-01-01', (endYear + 1) + '-01-01')
    .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'));
};

var landsat5 = filterLandsat('LANDSAT/LT05/C02/T1_L2');
var landsat7 = filterLandsat('LANDSAT/LE07/C02/T1_L2');
var landsat8 = filterLandsat('LANDSAT/LC08/C02/T1_L2');
var landsat9 = filterLandsat('LANDSAT/LC09/C02/T1_L2');

print('Landsat 5 images:', landsat5.size());
print('Landsat 7 images:', landsat7.size());
print('Landsat 8 images:', landsat8.size());
print('Landsat 9 images:', landsat9.size());


// ---------------------------------------------------------------------
// 3. MASK: remove bad pixels, and convert stored numbers to reflectance
// ---------------------------------------------------------------------

var cleanLandsat = function(image, bands) {
  // QA_PIXEL stores one yes/no flag per bit. All four of these flags
  // must be off for a pixel to count as clear.
  var qa = image.select('QA_PIXEL');
  var clear = qa.bitwiseAnd(1 << 1).eq(0)   // bit 1: dilated cloud
    .and(qa.bitwiseAnd(1 << 3).eq(0))       // bit 3: cloud
    .and(qa.bitwiseAnd(1 << 4).eq(0))       // bit 4: cloud shadow
    .and(qa.bitwiseAnd(1 << 5).eq(0));      // bit 5: snow

  // Collection 2 Level 2: stored value x 0.0000275, then - 0.2.
  // Without this step, NDVI is wrong because of the offset.
  var reflectance = image.select(bands, commonNames)
    .multiply(0.0000275)
    .add(-0.2);

  // Maths on an image drops its properties, so we copy back the date.
  return ee.Image(reflectance.updateMask(clear)
    .copyProperties(image, ['system:time_start', 'SPACECRAFT_ID']));
};

var clean5and7 = function(image) {
  return cleanLandsat(image, bandsLandsat5and7);
};
var clean8and9 = function(image) {
  return cleanLandsat(image, bandsLandsat8and9);
};

// Four sensors, one collection. Sensors differ slightly: see the
// slide on sensor changes before you interpret a trend.
var landsat = landsat5.map(clean5and7)
  .merge(landsat7.map(clean5and7))
  .merge(landsat8.map(clean8and9))
  .merge(landsat9.map(clean8and9));

print('All clean images:', landsat.size());
print('First image:', landsat.first());


// ---------------------------------------------------------------------
// 4. COMPUTE: add the indices to every image
// ---------------------------------------------------------------------

var addIndices = function(image) {
  var ndvi = image.normalizedDifference(['nir', 'red']).rename('NDVI');
  var nbr = image.normalizedDifference(['nir', 'swir2']).rename('NBR');
  return image.addBands(ndvi).addBands(nbr);
};

var withIndices = landsat.map(addIndices);


// ---------------------------------------------------------------------
// 5. COMPOSITE: one image per year
// ---------------------------------------------------------------------

// For each pixel: the median, plus the number of clear observations.
var medianAndCount = ee.Reducer.median().combine({
  reducer2: ee.Reducer.count(),
  sharedInputs: true
});

var years = ee.List.sequence(startYear, endYear);

var annual = ee.ImageCollection.fromImages(years.map(function(year) {
  return withIndices
    .filter(ee.Filter.calendarRange(year, year, 'year'))
    .select(['NDVI', 'NBR'])
    .reduce(medianAndCount)   // bands: NDVI_median, NDVI_count, ...
    .set('year', year);
}));

// A year without images gives an image without bands. Drop those years.
annual = annual
  .map(function(image) {
    return image.set('n_bands', image.bandNames().size());
  })
  .filter(ee.Filter.gt('n_bands', 0));

print('Years with data:', annual.size());


// ---------------------------------------------------------------------
// 6. CHECK: look at the data before you export anything
// ---------------------------------------------------------------------

// One composite for the map.
var exampleComposite = withIndices
  .filter(ee.Filter.calendarRange(exampleYear, exampleYear, 'year'))
  .median();

Map.centerObject(sites, 6);
Map.addLayer(exampleComposite,
  {bands: ['swir2', 'nir', 'red'], min: 0, max: 0.4},
  'False colour ' + exampleYear);
Map.addLayer(exampleComposite.select('NDVI'),
  {min: 0, max: 0.9, palette: ['white', 'yellow', 'green']},
  'NDVI ' + exampleYear);
Map.addLayer(sites, {color: 'red'}, 'Field sites');

// One site over time. Look for the fire, and for jumps between sensors.
var oneSite = sites.filter(ee.Filter.eq('site_id', exampleSite)).first();
var chart = ui.Chart.image.series({
  imageCollection: withIndices.select(['NBR', 'NDVI']),
  region: ee.Feature(oneSite).geometry().buffer(bufferMetres),
  reducer: ee.Reducer.mean(),
  scale: 30
}).setOptions({title: 'Clear observations at site ' + exampleSite});
print(chart);


// ---------------------------------------------------------------------
// 7. EXPORT: from Earth Engine to your own files
// ---------------------------------------------------------------------

// Export 1: a table for R, one row per site and year.
var sitesBuffered = sites.map(function(site) {
  return site.buffer(bufferMetres);
});

var table = annual.map(function(image) {
  return image.reduceRegions({
    collection: sitesBuffered,
    reducer: ee.Reducer.mean(),
    scale: 30
  }).map(function(site) {
    return site.set('year', image.get('year'));
  });
}).flatten();

print('First rows of the table:', table.limit(3));

Export.table.toDrive({
  collection: table,
  description: 'MINC1006_fire_sites_landsat',
  folder: 'MINC1006',
  fileFormat: 'CSV',
  selectors: ['site_id', 'burn_id', 'year',
              'NDVI_median', 'NDVI_count', 'NBR_median', 'NBR_count']
});

// Export 2: a GeoTIFF for QGIS, one fire and one year.
var fireSites = sites.filter(ee.Filter.eq('burn_id', exampleFire));
var fireArea = fireSites.geometry().bounds().buffer(3000).bounds();

Export.image.toDrive({
  image: exampleComposite.select(['NDVI', 'NBR']).toFloat(),
  description: 'MINC1006_' + exampleFire + '_' + exampleYear,
  folder: 'MINC1006',
  region: fireArea,
  scale: 30,
  crs: exampleCrs,
  maxPixels: 1e9
});

// Nothing is exported yet: open the Tasks tab and press RUN on each task.
