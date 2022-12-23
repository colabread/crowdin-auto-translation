const path = require('path');
const fs = require('fs');
const crowdin = require('@crowdin/crowdin-api-client');

const downloadZip = require('./downloadZip');
const unzip = require('./unzip');
const convertJson2Js = require('./convertJson2Js');
const clearOutput = require('./clearOutput');

module.exports = async (configPath) => {
  // 获取配置
  let config;
  const configAbsolutePath = path.join(path.resolve('./'), configPath);
  if (fs.existsSync(configAbsolutePath)) {
    config = require(configAbsolutePath);
  } else {
    throw new Error('config file does not exist');
  }
  const { token, engineId, projectId, targetLanguageIds, branch, file, sourceFilePath, outputPath, outputFilePrefix, isOutputFullName } = config;

  // 获取配置文件所在路径
  const prefixPath = path.dirname(configAbsolutePath);

  // 检查语言包源文件是否存在
  const sourceFileAbsolutePath = path.join(prefixPath, sourceFilePath);
  if (!fs.existsSync(sourceFileAbsolutePath)) {
    throw new Error('source lang file dose not exist');
  }

  // 检查输出文件目录是否存在
  const outputAbsolutePath = path.join(prefixPath, outputPath);
  if (!fs.existsSync(outputAbsolutePath)) {
    fs.mkdirSync(outputAbsolutePath);
  }

  // 创建crowdin sdk实例
  const { translationsApi, sourceFilesApi, uploadStorageApi } = new crowdin.default({ token });

  // 获取分支id和文件id
  let branchId, fileId;

  // 检查是否创建远程分支
  console.log('check if a individual branch has been created...')
  const branchListRes = await sourceFilesApi.listProjectBranches(projectId, { name: branch.name });
  if (branchListRes.data.length > 0) {
    branchId = branchListRes.data[0].data.id;

    // fetch fileId
    console.log('fetch remote fileId of individual branch...')
    const listFileRes = await sourceFilesApi.listProjectFiles(projectId, { branchId });
    fileId = listFileRes.data[0].data.id;

    // create storage
    console.log('create a storage for remote file...')
    const sourceFile = fs.readFileSync(sourceFileAbsolutePath);
    const sourceStr = sourceFile.toString();
    const begin = sourceStr.indexOf('{');
    const end = sourceStr.lastIndexOf('}') + 1;
    const jsonStr = sourceStr.substring(begin, end);
    const lang = eval('(' + jsonStr + ')'); // JSON.parse无法解析不带双引号的json字符串，eval可以转换
    const addStorageRes = await uploadStorageApi.addStorage(file.name, lang);
    const storageId = addStorageRes.data.id;

    // update file
    console.log('update remote file...')
    await sourceFilesApi.updateOrRestoreFile(projectId, fileId, { storageId });
  } else {
    // create branch
    console.log('create individual branch...')
    const createBranchRes = await sourceFilesApi.createBranch(projectId, { name: branch.name, title: branch.title });
    branchId = createBranchRes.data.id;

    // create storage
    console.log('create a storage for remote file...')
    const sourceFile = fs.readFileSync(sourceFileAbsolutePath);
    const sourceStr = sourceFile.toString();
    const begin = sourceStr.indexOf('{');
    const end = sourceStr.lastIndexOf('}') + 1;
    const jsonStr = sourceStr.substring(begin, end);
    const lang = eval('(' + jsonStr + ')'); // JSON.parse无法解析不带双引号的json字符串，eval可以转换
    const addStorageRes = await uploadStorageApi.addStorage(file.name, lang);
    const storageId = addStorageRes.data.id;

    // create file
    console.log('create remote file');
    const createFileRes = await sourceFilesApi.createFile(projectId, { 
      branchId,
      name: file.name,
      title: file.title,
      storageId: storageId,
      type: 'json'
    });
    fileId = createFileRes.data.id;
  }

  // pre-translation
  console.log('start translating...')
  let { data: { identifier: preTransId, progress: preTransProgress } } = await translationsApi.applyPreTranslation(projectId, {
    "languageIds": targetLanguageIds,
    "fileIds": [
      fileId
    ],
    "method": "mt",
    "engineId": engineId,
  })

  // loop to check the status of pre-translation
  while (preTransProgress < 100) {
    const preTransStatusRes = await translationsApi.preTranslationStatus(projectId, preTransId);
    preTransProgress = preTransStatusRes.data.progress;
    console.log(`pre-translation progress: ${preTransProgress}%`)
  }

  // build
  console.log('start building...')
  let { data: { id: buildId, progress: buildProgress } } = await translationsApi.buildProject(projectId, {
    branchId,
    "targetLanguageIds": targetLanguageIds
  }) 
           
  // loop to check the status of building
  while (buildProgress < 100) {
    let buildStatusRes = await translationsApi.checkBuildStatus(projectId, buildId);
    buildProgress = buildStatusRes.data.progress;
    console.log(`building progress: ${buildProgress}%`)
  }

  // fetch translations url
  console.log('fetch url of translated zip...')
  const { data: { url } } = await translationsApi.downloadTranslations(projectId, buildId);

  // download translations
  console.log('download translated zip...');
  await downloadZip(url, outputAbsolutePath);

  // unzip translations
  console.log('unzip...');
  await unzip(outputAbsolutePath);

  // convert translations
  console.log('convert json to js...');
  await convertJson2Js(outputAbsolutePath, outputFilePrefix, targetLanguageIds, isOutputFullName);
  
  // clear output folder
  console.log('clear download file...');
  clearOutput(outputAbsolutePath);

  console.log('done.');
}