# Crowdin 自动化翻译工具

## 命令
catr t [configPath]

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