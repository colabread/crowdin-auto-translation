const fs = require("fs");
const path = require("path");
const axios = require("axios");



const downloadZip = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    const dest = path.join(outputPath, "translated.zip");
    const options = {
      url,
      method: "get",
      responseType: "stream",
    }
    try {
      axios(options).then(res => {
        const { status: code } = res;
        if (code === 200) {
          const file = fs.createWriteStream(dest);
          res.data.pipe(file);
          file.on('finish', () => {
            resolve();
          })
        } else reject();
      });
    } catch (err) {
      reject(err);
    }
  })
}

module.exports = downloadZip;