const spawnSync = require('child_process').spawnSync;
const path = require('node:path');

async function compile(input, context) {
  // This is undocumented and could break.
  let basePath = context.app.vault.adapter.basePath;
  if (!basePath.endsWith("/")) {
    basePath = basePath + "/";
  }

  let projectPath = context.projectPath;
  if (!projectPath.endsWith("/")) {
    projectPath = projectPath + "/";
  }

  let userScriptPath = context.app?.plugins?.plugins?.longform?.cachedSettings?.userScriptFolder;
  if (!userScriptPath.endsWith("/")) {
    userScriptPath = userScriptPath + "/";
  }

  let epubCssPath = context.optionValues["epubCssPath"].trim();
  if (!epubCssPath) {
     epubCssPath = path.join(basePath, userScriptPath, 'pandoc', 'epub.css');
  }

  const pandocPath = context.optionValues["pandocPath"].trim();

  const compileAsDocx = context.optionValues["docx"];
  const compileAsEpub = context.optionValues["epub"];

  const app = context.app;
  const projectFolder = app.vault.getFolderByPath(context.projectPath);
  const projectFiles = projectFolder.children.filter((file) => file.extension === "md");
  const lastModifiedFile = projectFiles.sort((a, b) => b.stat.mtime - a.stat.mtime)[0];
  const manuscriptPath = path.join(basePath, lastModifiedFile.path);

  const outputFileName = lastModifiedFile.path.replace(/\.[^/.]+$/, "");
  const outputFilePath = path.join(basePath, outputFileName);

  console.log(outputFilePath);
  console.log(manuscriptPath);

  const processExport = () => {
    if (compileAsDocx) {
      const compiledFilePath = outputFilePath + ".docx";
      const docxResult = spawnSync(`"${pandocPath}"`, [`"${manuscriptPath}"`, '--from=markdown', `-o "${compiledFilePath}"`, '--to=docx', `--css="${epubCssPath}"`, '--toc', '--toc-depth=1', '-M toc-title="Table of Contents"', '-V toc-title="Table of Contents"', '-s'], {encoding: "utf-8", shell: true});
    }

    if (compileAsEpub) {
      const compiledFilePath = outputFilePath + ".epub";
      const epubResult = spawnSync(`"${pandocPath}"`, [`"${manuscriptPath}"`, '--from=markdown', `-o "${compiledFilePath}"`, '--to=epub', `--css="${epubCssPath}"`, '--toc', '--toc-depth=1', '-M toc-title="Table of Contents"', '-V toc-title="Table of Contents"', '-s'], {encoding: "utf-8", shell: true});
    }
  };

  await processExport();
}


module.exports = {
  description: {
    name: "Pandoc Export",
    description: "Exports manuscript using Pandoc",
    availableKinds: ["Manuscript"],
    options: [
      {
        id: "pandocPath",
        name: "Direct Path of Pandoc",
        description: "Run $ which pandoc in Mac/Linux or $ Get-Command pandoc in Windows",
        type: "Text",
        default: "",
      },
      {
        id: "epubCssPath",
        name: "CSS File Path specifically for the .epub exporter",
        description: "You can provide your own, or trust the one packaged with this script",
        type: "Text",
        default: "",
      },
      {
        id: "docx",
        name: "As a .docx file",
        description: "Export as a Microsoft Word .docx File",
        type: "Boolean",
        default: true,
      },
      {
        id: "epub",
        name: "As an .epub file",
        description: "Export as an EPUB File",
        type: "Boolean",
        default: true,
      },
    ],
  },
  compile:  compile,
};