const fs = require('fs');

const convert = (sourceFilePath, targetFilePath) => {
  let data = null;
  try {
    data = fs.readFileSync(sourceFilePath);
  } catch (err) {
    // console.error(err);
  }
  data && fs.writeFileSync(targetFilePath, 'export default ' + data);
}

const convertJson2Js = async (outputAbsolutePath, outputFilePrefix, targetLanguageIds, isOutputFullName) => {
  targetLanguageIds.forEach(langName => {
    const outputFileName = isOutputFullName ? langName : langName.split('-')[0];
    const sourceFilePath = `${outputAbsolutePath}/translated/${langName}/lang.json`;
    const targetFilePath = `${outputAbsolutePath}/${outputFilePrefix ? outputFilePrefix + '_' + outputFileName : outputFileName}.js`;
    convert(sourceFilePath, targetFilePath);
  })
}

module.exports = convertJson2Js