const fs = require("fs");

const convert = (sourceFilePath, targetFilePath) => {
  let data = null;
  try {
    data = fs.readFileSync(sourceFilePath);
  } catch (err) {
    // console.error(err);
  }
  data && fs.writeFileSync(targetFilePath, data);
};

const convertJson2Js = async (
  directory,
  outputAbsolutePath,
  outputFilePrefix,
  targetLanguageIds,
  isOutputFullName
) => {
  targetLanguageIds.forEach((langName) => {
    const outputFileName = isOutputFullName ? langName : langName.split("-")[0];
    let sourceFilePath = `${outputAbsolutePath}/translated/${langName}/${directory}/lang.js`;
    if(!fs.existsSync(sourceFilePath)){
      const noSrcDir = directory.replace(/\/src$/, '/lang');
      sourceFilePath = `${outputAbsolutePath}/translated/${noSrcDir}/lang_${outputFileName}.js`;
    }
    
    const targetFilePath = `${outputAbsolutePath}/${
      outputFilePrefix
        ? outputFilePrefix + "_" + outputFileName
        : outputFileName
    }.js`;
    convert(sourceFilePath, targetFilePath);
  });
};

module.exports = convertJson2Js;
