var ndarray = require('ndarray');

function flattenND(obj) {
  var arr = [];
  for (var y = 0; y < obj.shape[1]; ++y) {
    for (var x = 0; x < obj.shape[0]; ++x) {
      for (var z = 0; z < obj.shape[2]; ++z) {
        arr.push(obj.get(x,y,z));
      }
    }
  }
  return arr;
}

module.exports = {
  flattenND: flattenND
}
