const { exec } = require('child_process');

const unzip = (outputAbsolutePath) => {
  return new Promise((resolve, reject) => {
    const cmd = `unzip ${outputAbsolutePath}/translated.zip -d ${outputAbsolutePath}/translated`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve();
    });
  })
}

module.exports = unzip;