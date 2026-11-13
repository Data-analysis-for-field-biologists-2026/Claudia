// =====================================================================
// M.INC 1006, 17 November 2026
// Script 2: template for your own Task 3 area, using Sentinel-2
//
// Result: one table with a value per year for your area, and one
// GeoTIFF for QGIS.
//
// The example is the Solling. Replace the settings with your own area,
// years, season and index, and explain every change in a comment.
// =====================================================================


// ---------------------------------------------------------------------
// 0. SETTINGS
// ---------------------------------------------------------------------

// Your area: [west, south, east, north] in degrees.
// You can also draw a polygon on the map and write:  var area = geometry;
var area = ee.Geometry.Rectangle([9.4, 51.6, 9.7, 51.8]);

var projectName = 'Solling';  // used in the file names
var startYear = 2019;         // Sentinel-2 Level 2A is complete from here
var endYear = 2025;
var startMonth = 6;           // June
var endMonth = 8;             // August

var clearThreshold = 0.60;    // Cloud Score+: 0.50 to 0.65 usually works
var forestOnly = true;        // true: keep tree cover only
var exampleYear = 2022;       // year shown on the map and exported
var exportCrs = 'EPSG:25832'; // UTM zone 32N: suits most of Germany


// ---------------------------------------------------------------------
// 1. FIND
// ---------------------------------------------------------------------

var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');
var cloudScore = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED');
var worldCover = ee.ImageCollection('ESA/WorldCover/v200').first().select('Map');


// ---------------------------------------------------------------------
// 2. FILTER, then link the cloud score to each image
// ---------------------------------------------------------------------

var filtered = sentinel2
  .filterBounds(area)
  .filterDate(startYear + '-01-01', (endYear + 1) + '-01-01')
  .filter(ee.Filter.calendarRange(startMonth, endMonth, 'month'))
  .linkCollection(cloudScore, ['cs_cdf']);

print('Number of images:', filtered.size());
print('First image:', filtered.first());


// ---------------------------------------------------------------------
// 3. MASK and scale
// ---------------------------------------------------------------------

var cleanSentinel2 = function(image) {
  var clear = image.select('cs_cdf').gte(clearThreshold);
  var mask = clear;
  if (forestOnly) {
    mask = clear.and(worldCover.eq(10));  // 10 is tree cover in WorldCover
  }

  // Sentinel-2 surface reflectance: stored value / 10000.
  var reflectance = image
    .select(['B2', 'B3', 'B4', 'B8', 'B11', 'B12'],
            ['blue', 'green', 'red', 'nir', 'swir1', 'swir2'])
    .divide(10000);

  return ee.Image(reflectance.updateMask(mask)
    .copyProperties(image, ['system:time_start']));
};


// ---------------------------------------------------------------------
// 4. COMPUTE
// ---------------------------------------------------------------------

var addIndices = function(image) {
  var ndvi = image.normalizedDifference(['nir', 'red']).rename('NDVI');
  var ndmi = image.normalizedDifference(['nir', 'swir1']).rename('NDMI');
  return image.addBands(ndvi).addBands(ndmi);
};

var withIndices = filtered.map(cleanSentinel2).map(addIndices);


// ---------------------------------------------------------------------
// 5. COMPOSITE: one image per year
// ---------------------------------------------------------------------

var medianAndCount = ee.Reducer.median().combine({
  reducer2: ee.Reducer.count(),
  sharedInputs: true
});

var years = ee.List.sequence(startYear, endYear);

var annual = ee.ImageCollection.fromImages(years.map(function(year) {
  return withIndices
    .filter(ee.Filter.calendarRange(year, year, 'year'))
    .select(['NDVI', 'NDMI'])
    .reduce(medianAndCount)
    .set('year', year);
}));

// A year without images gives an image without bands. Drop those years.
annual = annual
  .map(function(image) {
    return image.set('n_bands', image.bandNames().size());
  })
  .filter(ee.Filter.gt('n_bands', 0));


// ---------------------------------------------------------------------
// 6. CHECK
// ---------------------------------------------------------------------

var exampleComposite = withIndices
  .filter(ee.Filter.calendarRange(exampleYear, exampleYear, 'year'))
  .median();

var exampleCount = withIndices
  .filter(ee.Filter.calendarRange(exampleYear, exampleYear, 'year'))
  .select('NDVI')
  .count();

Map.centerObject(area, 10);
Map.addLayer(exampleComposite,
  {bands: ['red', 'green', 'blue'], min: 0, max: 0.2},
  'True colour ' + exampleYear);
Map.addLayer(exampleComposite.select('NDVI'),
  {min: 0, max: 0.9, palette: ['white', 'yellow', 'green']},
  'NDVI ' + exampleYear);
Map.addLayer(exampleCount,
  {min: 0, max: 20, palette: ['red', 'yellow', 'blue']},
  'Clear observations ' + exampleYear);

// Scale 100 m keeps the chart fast. The export below uses 10 m.
print(ui.Chart.image.series({
  imageCollection: annual.select(['NDVI_median', 'NDMI_median']),
  region: area,
  reducer: ee.Reducer.mean(),
  scale: 100,
  xProperty: 'year'
}).setOptions({title: 'Summer median, mean over the area'}));


// ---------------------------------------------------------------------
// 7. EXPORT
// ---------------------------------------------------------------------

// Export 1: a table for R, one row per year.
var table = ee.FeatureCollection(annual.map(function(image) {
  var means = image.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: area,
    scale: 10,
    maxPixels: 1e10,
    tileScale: 4
  });
  return ee.Feature(null, means).set('year', image.get('year'));
}));

Export.table.toDrive({
  collection: table,
  description: 'MINC1006_' + projectName + '_annual',
  folder: 'MINC1006',
  fileFormat: 'CSV',
  selectors: ['year', 'NDVI_median', 'NDVI_count', 'NDMI_median', 'NDMI_count']
});

// Export 2: a GeoTIFF for QGIS.
Export.image.toDrive({
  image: exampleComposite.select(['NDVI', 'NDMI']).toFloat(),
  description: 'MINC1006_' + projectName + '_' + exampleYear,
  folder: 'MINC1006',
  region: area,
  scale: 10,
  crs: exportCrs,
  maxPixels: 1e10
});

// Nothing is exported yet: open the Tasks tab and press RUN on each task.
