# pi-motion-detection
Use a Raspberry Pi camera to detect motion and upload the images to Google Drive

### Instructions: 
1) Follow Step 1 at this link, https://developers.google.com/drive/v3/web/quickstart/nodejs, to activate the Google Drive API
  a) Place the client_secret.json file in the root of the Node project
2) Run the quickstart.js file using node (node quickstart.js) and follow the instructions in the terminal
3) Run the index.js file (index.js) to begin the process



Photos will be automatically taken every 15 seconds and if a significant change occurs in the image, it will be uploaded to your Google Drive account. To change the image timer, go into the camera.js file and change the interval time (if you make it too low, the Pi won't be able to process the images fast enough and crash)
