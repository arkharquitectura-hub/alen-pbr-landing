const fs = require('fs');
const path = require('path');
const oldPath = path.join(__dirname, 'D5 ELEMENTS AND TEXTURES (1).mp4');
const newPath = path.join(__dirname, 'd5_elements.mp4');
if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log('Renamed successfully');
} else {
    console.log('File not found: ' + oldPath);
}
