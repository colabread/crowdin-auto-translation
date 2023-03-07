const { exec } = require("child_process");
const os = require("os");
const adm_zip = require("adm-zip");

const unzip = (outputAbsolutePath) => {
  return new Promise((resolve, reject) => {
    if (os.type() == "Windows_NT") {
      let unzip = new adm_zip(`${outputAbsolutePath}/translated.zip`);
      unzip.extractAllTo(
        `${outputAbsolutePath}/translated`,
        /*overwrite*/ true
      );
      resolve();
    } else {
      const cmd = `unzip ${outputAbsolutePath}/translated.zip -d ${outputAbsolutePath}/translated`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) reject(stderr);
        else resolve();
      });
    }
  });
};

module.exports = unzip;
