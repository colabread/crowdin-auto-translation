const fs = require("fs");

const clearOutput = (outputPath) => {
  fs.rmdirSync(`${outputPath}/translated`, { recursive: true, force: true });
  fs.unlinkSync(`${outputPath}/translated.zip`);
}

module.exports = clearOutput;