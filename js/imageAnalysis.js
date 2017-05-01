var pixels = require('get-pixels');
var array = require('./flattenArray.js');
var Motion = require('motion-detect').Motion;
var motion = new Motion();

// Extracts pixel data from image file
function getPixelData(img) {
  return new Promise(function(resolve, reject) {
    pixels(img, function(err, pixels) {
      if (err)
        reject(Error('Bad image path'));
      var imgData = array.flattenND(pixels);
      resolve(imgData);
    });
  });
}

// Checks if motion has occured in image
function checkMotion(pixelData, refImg) {
  return new Promise(function(resolve, reject) {
    var result = motion.detect(pixelData, refImg);
    console.log('motion:', result);
    resolve(result);
  });
}

module.exports = {
  getPixelData: getPixelData,
  checkMotion: checkMotion
}
