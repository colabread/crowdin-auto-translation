# Crowdin 自动化翻译工具

## 命令

## 配置文件注释
```
{
  "token": string, // crowdin账号凭证
  "engineId": number, // crowdin翻译引擎id，可通过sdk或api查询
  "projectId": number,  // crowdin项目id，可通过sdk或api查询
  "targetLanguageIds": string[],  // 目标语言id数组，可通过sdk或api查询
  "branch": {
    "name": string,  // crowdin分支名
    "title": string,  //  crowdin分支描述
  },
  "file": {
    "name": string, // crowdin分支下的语言包源文件名，目前只支持json
    "title": string,  // crowdin分支下的语言包源文件描述
  },
  "sourceFilePath": string, // 本地语言包源文件路径（相对于配置文件）
  "outputPath": string, // 输出目录路径（相对于配置文件）
  "outputFilePrefix": string, // 输出文件前缀，比如"lang" -> "lang_en.js"
  "isOutputFullName": boolean,  // 输入文件名是否保持全名，false: es-ES -> es
}
```

# Crowdin Auto-Translation

Crowdin Auto-Translation 是一个使用 Crowdin API 自动翻译并上传项目文件的 Node.js 脚本。该脚本可帮助您轻松地将翻译后的文件上传到 Crowdin 项目。

## 功能

1. 创建分支
2. 创建目录结构
3. 上传并更新文件
4. 自动翻译文件
5. 构建并下载翻译后的文件

## 安装

1. 克隆此仓库
2. 运行 `npm install` 安装依赖项
3. 在项目中创建一个 `.env` 文件，其中包含您的 Crowdin API 密钥

```
CROWDIN_API_KEY=<your_crowdin_api_key>
```

## 使用方法

1. 在 `config.js` 文件中配置项目参数：

```javascript
const config = {
  projectId: <your_project_id>,
  accessToken: process.env.CROWDIN_API_KEY,
  sourceLanguage: 'en',
  targetLanguages: ['zh-CN', 'es', 'de'],
  branchName: 'auto-translated',
  files: [
    {
      name: 'lang.json',
      content: '{"hello": "Hello", "world": "World"}',
    },
  ],
  directoryPath: 'web/test1',
};
```

2. 运行 `catr t [configPath]` 启动脚本

## 参数说明

- `projectId`：Crowdin 项目的 ID
- `accessToken`：Crowdin API 密钥（从 `.env` 文件获取）
- `sourceLanguage`：源语言代码（例如 'en'）
- `targetLanguages`：要翻译的目标语言代码数组（例如 `['zh-CN', 'es', 'de']`）
- `branchName`：要创建的分支名称
- `files`：要上传的文件数组，每个文件包含以下属性：
  - `name`：文件名
  - `content`：文件内容
- `directoryPath`：在 Crowdin 项目中创建的目录路径

## 注意事项

请确保您在运行此脚本之前已经获取了有效的 Crowdin API 密钥，并将其保存在 `.env` 文件中。此外，请确保您的项目配置与实际需求相符。

## 许可

本项目使用 MIT 许可。