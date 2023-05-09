const path = require("path");
const fs = require("fs");
const crowdin = require("@crowdin/crowdin-api-client");

const downloadZip = require("./downloadZip");
const unzip = require("./unzip");
const convertJson2Js = require("./convertJson2Js");
const clearOutput = require("./clearOutput");

async function getFileId(
  sourceFilesApi,
  projectId,
  filePath,
  branchId = undefined,
  directoryId = undefined
) {
  const listParams = directoryId ? { directoryId } : { branchId };
  const filesList = await sourceFilesApi.listProjectFiles(
    projectId,
    listParams
  );
  const file = filesList.data.find((f) => f.data.path === filePath);
  console.log(file, filesList.data, filePath);
  return file ? file.data.id : null;
}

async function getOrCreateDirectory(
  sourceFilesApi,
  projectId,
  branchId,
  directoryPath
) {
  const directoriesRes = await sourceFilesApi.listProjectDirectories(
    projectId,
    {
      branchId,
    }
  );

  let directory = directoriesRes.data.find(
    (dir) => dir.data.name === directoryPath
  );

  if (!directory) {
    console.log(`Creating remote directory: ${directoryPath}`);
    directory = await sourceFilesApi.createDirectory(projectId, {
      name: directoryPath,
      branchId,
    });
  }

  return directory.data.id;
}

async function createDirectoriesRecursively(
  sourceFilesApi,
  projectId,
  branchId,
  directoryPath
) {
  const pathParts = directoryPath.split("/");
  let currentPath = "";
  let currentDirectoryId;

  for (const pathPart of pathParts) {
    currentPath = path.join(currentPath, pathPart);
    currentDirectoryId = await getOrCreateDirectory(
      sourceFilesApi,
      projectId,
      branchId,
      currentPath
    );
  }

  return currentDirectoryId;
}

module.exports = async (configPath) => {
  try {
    // 获取配置
    const configAbsolutePath = path.resolve(configPath);
    if (!fs.existsSync(configAbsolutePath)) {
      throw new Error("config file does not exist");
    }
    const config = require(configAbsolutePath);

    const {
      token,
      engineId,
      projectId,
      targetLanguageIds,
      branch,
      file,
      sourceFilePath,
      outputPath,
      outputFilePrefix,
      isOutputFullName,
      directory,
    } = config;

    // 获取配置文件所在路径
    const prefixPath = path.dirname(configAbsolutePath);

    // 检查语言包源文件是否存在
    const sourceFileAbsolutePath = path.join(prefixPath, sourceFilePath);
    if (!fs.existsSync(sourceFileAbsolutePath)) {
      throw new Error("source lang file does not exist");
    }

    // 检查输出文件目录是否存在
    const outputAbsolutePath = path.join(prefixPath, outputPath);
    if (!fs.existsSync(outputAbsolutePath)) {
      fs.mkdirSync(outputAbsolutePath);
    }

    // 创建crowdin sdk实例
    const { translationsApi, sourceFilesApi, uploadStorageApi } =
      new crowdin.default({ token });

    // 获取分支id和文件id
    let branchId, fileId;

    // 检查是否创建远程分支
    console.log("check if a individual branch has been created...");
    const branchListRes = await sourceFilesApi.listProjectBranches(projectId, {
      name: branch.name,
    });

    if (branchListRes.data.length > 0) {
      branchId = branchListRes.data[0].data.id;
    } else {
      // create branch
      console.log("create individual branch...");
      const createBranchRes = await sourceFilesApi.createBranch(projectId, {
        name: branch.name,
        title: branch.title,
      });
      branchId = createBranchRes.data.id;
    }

    // 创建或获取目录
    const directoryId = await createDirectoriesRecursively(
      sourceFilesApi,
      projectId,
      branchId,
      directory
    );

    // 获取或创建文件
    fileId = await getFileId(
      sourceFilesApi,
      projectId,
      `/${branch.name}/${directory}/${file.name}`,
      branchId,
      directoryId
    );

    console.log("getFileId:", fileId);
    // 读取文件
    const sourceFile = fs.readFileSync(sourceFileAbsolutePath);
    const sourceStr = sourceFile.toString();
    const begin = sourceStr.indexOf("{");
    const end = sourceStr.lastIndexOf("}") + 1;
    const jsonStr = sourceStr.substring(begin, end);
    const lang = eval("(" + jsonStr + ")"); // JSON.parse无法解析不带双引号的json字符串，eval可以转换
    const addStorageRes = await uploadStorageApi.addStorage(file.name, lang);
    const storageId = addStorageRes.data.id;

    if (fileId === null) {
      // 创建文件
      console.log("create remote file");
      const createFileRes = await sourceFilesApi.createFile(projectId, {
        branchId,
        directoryId,
        name: file.name,
        title: file.title,
        storageId: storageId,
        type: "json",
      });
      fileId = createFileRes.data.id;
    } else {
      // 更新文件
      console.log("update remote file...");
      await sourceFilesApi.updateOrRestoreFile(projectId, fileId, {
        storageId,
      });
    }

    // 预翻译
    console.log("start translating...");
    let {
      data: { identifier: preTransId, progress: preTransProgress },
    } = await translationsApi.applyPreTranslation(projectId, {
      languageIds: targetLanguageIds,
      fileIds: [fileId],
      method: "mt",
      engineId: engineId,
    });

    // 循环检查预翻译状态
    while (preTransProgress < 100) {
      const preTransStatusRes = await translationsApi.preTranslationStatus(
        projectId,
        preTransId
      );
      preTransProgress = preTransStatusRes.data.progress;
      console.log(`pre-translation progress: ${preTransProgress}%`);
    }

    // 构建
    console.log("start building...");
    let {
      data: { id: buildId, progress: buildProgress },
    } = await translationsApi.buildProject(projectId, {
      branchId,
      targetLanguageIds: targetLanguageIds,
    });

    // 循环检查构建状态
    while (buildProgress < 100) {
      const buildStatusRes = await translationsApi.checkBuildStatus(
        projectId,
        buildId
      );
      buildProgress = buildStatusRes.data.progress;
      console.log(`building progress: ${buildProgress}%`);
    }

    // 获取翻译文件的URL
    console.log("fetch url of translated zip...");
    const {
      data: { url },
    } = await translationsApi.downloadTranslations(projectId, buildId);

    // 下载翻译文件
    console.log("download translated zip...");
    await downloadZip(url, outputAbsolutePath);

    // 解压翻译文件
    console.log("unzip...");
    await unzip(outputAbsolutePath);

    // 将翻译文件从JSON转换为JS
    console.log("convert json to js...");
    await convertJson2Js(
      outputAbsolutePath,
      outputFilePrefix,
      targetLanguageIds,
      isOutputFullName
    );

    // 清理输出文件夹
    console.log("clear download file...");
    clearOutput(outputAbsolutePath);

    console.log("done.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// 优化后的代码模块
async function createDirectoriesRecursively(
  sourceFilesApi,
  projectId,
  branchId,
  directoryPath
) {
  const pathParts = directoryPath.split("/");
  let currentPath = "";
  let parentDirectoryId;

  for (const pathPart of pathParts) {
    currentPath = path.join(currentPath, pathPart);
    console.log("branchId:", branchId, "parentDirectoryId:", parentDirectoryId);

    const listParams = parentDirectoryId
      ? { directoryId: parentDirectoryId }
      : { branchId };

    const directoriesList = await sourceFilesApi.listProjectDirectories(
      projectId,
      listParams
    );

    const existingDirectory = directoriesList.data.find(
      (dir) => dir.data.name === pathPart
    );

    if (existingDirectory) {
      parentDirectoryId = existingDirectory.data.id;
    } else {
      console.log(`Creating remote directory: ${currentPath}`);

      const directoryData = {
        name: pathPart,
        title: pathPart,
      };

      if (parentDirectoryId) {
        directoryData.directoryId = parentDirectoryId;
      } else {
        directoryData.branchId = branchId;
      }

      const newDirectory = await sourceFilesApi.createDirectory(
        projectId,
        directoryData
      );
      parentDirectoryId = newDirectory.data.id;
    }
  }

  return parentDirectoryId;
}
