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

  let epubMetadataPath = context.optionValues["epubMetadataPath"].trim();
  if (!epubMetadataPath) {
    epubMetadataPath = 'meta.yml';
  }

  const metadataPath = path.join(basePath, projectPath, epubMetadataPath);

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

  const tocArgs = context.optionValues["toc"] ? ['--toc',  '--toc-depth=1', '-M toc-title="Table of Contents"', '-V toc-title="Table of Contents"'] : [];

  const processExport = () => {
    if (compileAsDocx) {
      const compiledFilePath = outputFilePath + ".docx";
      console.log('Compiling DocX File at "' + compiledFilePath + '" using css at "' + epubCssPath + '"');

      const docxResult = spawnSync(`"${pandocPath}"`, [
        `"${manuscriptPath}"`,
        '--from=markdown',
        `-o "${compiledFilePath}"`,
        '--to=docx', 
        `--css="${epubCssPath}"`,
        ...tocArgs,
        '-s'
      ], {encoding: "utf-8", shell: true});
      
      if (docxResult.status !== 0) {
        console.log(docxResult.stderr)
        console.log(docxResult.stdout)
      }
    }

    if (compileAsEpub) {
      const compiledFilePath = outputFilePath + ".epub";
      console.log('Compiling EPUB File at "' + compiledFilePath + '" using metadata at "' + metadataPath + '" and css at "' + epubCssPath + '"');
      
      let metadataArg = "--metadata-file=";
      if (metadataPath.includes('.xml')) {
        metadataArg = "--epub-metadata=";
      }

      const epubResult = spawnSync(`"${pandocPath}"`, [
        `"${manuscriptPath}"`,
        '--from=markdown',
        `-o "${compiledFilePath}"`,
        '--to=epub',
        `${metadataArg}"${metadataPath}"`,
        `--css="${epubCssPath}"`,
        ...tocArgs,
        '-s'
      ], {encoding: "utf-8", shell: true});

      if (epubResult.status !== 0) {
        console.log(epubResult.stderr)
        console.log(epubResult.stdout)
      }
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
        description: "Run '$ which pandoc' in Mac/Linux or '$ Get-Command pandoc' in Windows Powershell to discover the direct path.",
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
        id: "epubMetadataPath",
        name: "Location of your epub metadata file.",
        description: "Leave this blank to look for meta.yml in the project index folder. ePubs without metadata will often not be accepted by major ebook retailers. Can be either a .yml file or in an .xml file, adhering to the Dublic Core standards.",
        type: "Text",
        default: "",
      },
      {
        id: "toc",
        name: "Include a Table of Contents?",
        description: "Table of Contents will be automatically generated. For .docx files, the table of contents must be manually refreshed on the first open of the file.",
        type: "Boolean",
        default: true,
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
