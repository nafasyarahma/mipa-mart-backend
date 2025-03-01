const fs = require('fs');

class StorageSevice {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const timestamp = +new Date();
    const sanitizedFilename = meta.filename.replace(/\s+/g, '-');
    const filename = `${timestamp}_${sanitizedFilename}`;
    const path = `${this._folder}/${filename}`;
    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageSevice;
