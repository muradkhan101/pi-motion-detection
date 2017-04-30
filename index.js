var Motion = require('motion-detect').Motion;
var google = require('googleapis');
var googleAuth = require('googleLogin.js');
var chokidar = require('chokidar');
var fs = require('fs');
var ndarray = require('ndarray');
var pixels = require('get-pixels');
var motion = new Motion();

var imgDir = process.cwd() + '/files/';
var saveDir = process.cwd() + '/savedImages/'
var refImg = undefined;
var refImgDir = undefined;
var tempData;
var tempDir;


// var watcher = chokidar.watch(imgDir);
// watcher.on('add', (path) => {
//     if (refImg === undefined) refImg = path;
//     fs.readdir(imgDir,checkMotion);
// });

function setup() {
  if (fs.existsSync(imgDir) === false) fs.mkdir(imgDir);
  else (fs.readdirSync(imgDir).forEach(function(e) {
    fs.unlink(imgDir+e, function(err) {
      if (err) console.log('Couldnt delete e', err);
    })
  }))
  if (fs.existsSync(saveDir) === false) fs.mkdir(saveDir);
  var watcher = chokidar.watch(imgDir);
  watcher.on('add', (path) => {
    if (!(path.indexOf('DS_Store') > 0)) {
      var files = fs.readdirSync(imgDir);
      console.log(files);
      if (files.length <= 1) {
        getPixelData(path).then(function() {
          console.log('First image loaded');
          refImgDir = path;
        });
      }
      else if (files.length > 1) {
        main(path);
      }
    }
  });
}

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

function getPixelData(img) {
  return new Promise(function(resolve, reject) {
    pixels(img, function(err, pixels){
      if (err) reject(Error('Bad image path'));
      var imgData = flattenND(pixels);
      if (!refImg) refImg = imgData;
      resolve(imgData);
    });
  });
}

function checkMotion(pixelData) {
  return new Promise(function(resolve, reject) {
    tempData = pixelData;
    var result = motion.detect(pixelData, refImg);
    console.log('motion:', result);
    resolve(result);
  });
}

function uploadImage(img) {
  console.log('file');
  var drive = google.drive({ version: 'v3', auth: googleAuth.oauth2Client });
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    fs.readFile(img, function(erro, imgFile) {
      console.log('Image loaded', imgFile);
      if (erro) {
        console.log('Error loading image:', err);
        return;
      }
      googleAuth.authorize(JSON.parse(content), function(auth) {
        drive.files.create({
          auth: auth,
          resource: {
            name: 'testimage.png',
            mimeType: 'image/png'
          },
          media: {
            mimeType: 'image/png',
            body: imgFile
          }
        });
      })
    });
  });
}

function handleImage(img) {
  fs.writeFileSync(saveDir+img.slice-8, img);
  fs.unlinkSync(img);
}

function main(img) {
  getPixelData(img).then(checkMotion).then((result) => {
    if (result === true) {
      uploadImage(img);
    }
    else {
      refImg = tempData;
      refImgDir = img;
    }
    console.log('uploaded');
  }).catch((err) => {
    console.log('Something went wrong', err);
  });
}

setup(imgDir);
