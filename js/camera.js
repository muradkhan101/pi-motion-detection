var terminal = require('node-cmd');
var fs = require('fs');
var fileDir = './imageCount.txt';
function startTakingImages() {
  setInterval(function() {
    var imgCount;
    fs.open(fileDir, 'r+', (err, fd) => {
      if (err) {
        console.log('Creating file imageCount.txt');
        imgCount = 0;
        fs.writeFile(fileDir, String(imgCount), (err) => {
          if (err)
            console.log('Failed to write file:', err);
          terminal.run(`raspistill -o ${imgCount}.jpg -t 1000`);
        });
      } else {
        fs.readFile(fileDir, 'utf8', (err, data) => {
          if (err)
            console.log('Failed to readFile:', err);
          var imgCount = Number(data) + 1;
          fs.writeFile(fileDir, String(imgCount), (err) => {
            if (err)
              throw err;
            });
          terminal.run(`raspistill -o ${imgCount}.jpg -t 1000`);
        })
      }
    })
  }, 15000);
}

function getImgCount() {
  return fs.readFileSync(fileDir, 'utf8');
}

module.exports = {
  startTakingImages: startTakingImages,
  getImgCount: getImgCount
}
