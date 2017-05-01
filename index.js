var google = require('googleapis');
var googleAuth = require('./js/googleLogin.js');
var chokidar = require('chokidar');
var fs = require('fs');
var camera = require('./js/camera.js');
var imageAnalysis = require('./js/imageAnalysis.js');

var imgDir = './images/';
var refImg = undefined;
var refImgDir = undefined;
var tempData;
var tempDir;

// Creates images folder and starts watching for changes
function setup() {
  if (fs.existsSync(imgDir) === false)
    fs.mkdir(imgDir);
  else
    (fs.readdirSync(imgDir).forEach(function(e) {
      fs.unlink(imgDir + e, function(err) {
        if (err)
          console.log('Couldnt delete ${e}', err);
        }
      )
    }))
  var watcher = chokidar.watch(imgDir);
  watcher.on('add', (path) => {
    if (!(path.indexOf('DS_Store') > 0)) {
      var files = fs.readdirSync(imgDir);
      console.log(files);
      if (files.length <= 1) {
        imageAnalysis.getPixelData(path).then(function(data) {
          console.log('First image loaded');
          refImg = data;
          refImgDir = path;
        });
      } else if (files.length > 1) {
        main(path);
      }
    }
  });
  camera.startTakingImages();
}

// Uploads file to Google Drive
function uploadImage(img) {
  console.log(img, 'from uploadImage');
  var drive = google.drive({version: 'v3', auth: googleAuth.oauth2Client});
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    fs.readFile(img, function(erro, imgFile) {
      if (erro) {
        console.log('Error loading image:', err);
        return;
      }
      googleAuth.authorize(JSON.parse(content), function(auth) {
        drive.files.create({
          auth: auth,
          resource: {
            parents: ['0B9eTEQ8345yWb0pscmF1cFFCRmM'],
            name: `IMG${camera.getImgCount()}.jpg`,
            mimeType: 'image/jpg'
          },
          media: {
            mimeType: 'image/jpg',
            body: imgFile
          }
        });
      })
      fs.unlinkSync(img);
    });
  });
}

function main(img) {
  tempDir = img;
  imageAnalysis.getPixelData(img).then((imgData)=>{
    if (!refImg)
      refImg = imgData;
    tempData = imgData;
    imageAnalysis.checkMotion(imgData, refImg).then(result => {
      if (result === true) {
        uploadImage(tempDir);
      } else {
        fs.unlinkSync(refImgDir);
        refImg = tempData;
        refImgDir = img;
      }
    });
  }).catch((err) => {
    console.log('Something went wrong', err);
  });
}

setup(imgDir);
