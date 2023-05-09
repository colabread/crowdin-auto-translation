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

```
CROWDIN_API_KEY=<your_crowdin_api_key>
```

## 使用方法

1. 在 `config.json` 文件中配置项目参数：

```json
{
  "token": "Your Crowdin API 密钥",
  "engineId": 328890,
  "projectId": "your_project_id",
  "targetLanguageIds": [
    "fr",
    "es-ES",
    "de",
    "ja",
    "pt-PT",
    "ru",
    "id",
    "zh-CN"
  ],
  "branch": {
    "name": "dingnan",
    "title": "branch title"
  },
  "file": {
    "name": "lang.json",
    "title": "lang"
  },
  "directoryTitle": "webTest1",
  "directory": "web/test1",
  "sourceFilePath": "./lang_en.js",
  "outputPath": "./lang",
  "outputFilePrefix": "lang",
  "isOutputFullName": false
};
```

1. 开发启动脚本 `node index.js t ./catr.config.json`
2. 使用运行脚本 `catr t [configPath]`

## 参数说明

- `token`：Crowdin API 密钥
- `engineId`：翻译引擎 ID
- `projectId`：Crowdin 项目的 ID
- `targetLanguageIds`：要翻译的目标语言代码数组（例如 `["fr", "es-ES", "de", "ja", "pt-PT", "ru", "id", "zh-CN"]`）
- `branch`：要创建的分支对象，包含以下属性：
  - `name`：分支名称 不需要加斜杠
  - `title`：分支标题
- `file`：要上传的文件对象，包含以下属性：
  - `name`：文件名 不需要加斜杠
  - `title`：文件标题
- `directoryTitle`：要在 Crowdin 项目中创建的目录标题 开头结尾不需要加斜杠
- `directory`：要在 Crowdin 项目中创建的目录路径
- `sourceFilePath`：源文件路径
- `outputPath`：输出文件路径
- `outputFilePrefix`：输出文件名前缀
- `isOutputFullName`：是否输出完整文件名（布尔值）

## 注意事项

请确保您在运行此脚本之前已经获取了有效的 Crowdin API 密钥。此外，请确保您的项目配置与实际需求相符。

## 许可

本项目