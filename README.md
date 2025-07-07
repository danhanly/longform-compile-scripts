# Obsidian 🫶 Longform 🫶 Pandoc

Longform is a writing plugin for Obsidian. One of the features is that it allows you to compile your writing project, taking it through a series of steps to produce a final document. This may be things like stripping out internal links, or removing comments. But often we can take things a step further...

This script will add a brand new User Compile Step that will give you the ability to export your writing project as a .docx or a .epub file, with all the configuration necessary to set it up correctly.

Add these files wherever you've chosen to store your Longform Compile Step Scripts, and if your Longform Settings recognises the script, you'll be good to go.

P.S. Don't forget to install `pandoc`, and then paste in pandoc's path location into the compile step. [Download and Install Pandoc](https://github.com/jgm/pandoc).

## Metadata File

Exporting as Epub requires a metadata file. By default this script will look for a meta.yml file included in your project root directory, but you can change this by specifying the path in the compile step.

Metadata should be either in a yml format, or an xml format that adheres to the Dublin Core standard.

[Info about pandoc's epub metadata provision.](https://pandoc.org/demo/example33/11.1-epub-metadata.html)

## Special Sections

Within the prepackaged CSS file, is provision for both a Copyright section and an Acklowledgements section.

To activate these, wrap your copyright page content in a div with the id 'copyright', and your acknowledgements in a div with the id 'acknowledgements', then make sure the content within uses paragraph tags, like so:

```
<div id=”copyright”>
  <p>Copyright, © Dan Hanly 2025. All rights reserved.</p>
  <p>Published by Dan Hanly</p>
  <p>This is a work of fiction. Any resemblance to actual persons, living or dead, events, or locales is entirely coincidental.</p>
  ...
</div>

<div id=”acknowledgements”>
  <p>For my wife and kids...</p>
</div>
```

There is a known issue with these being styled correctly, but I believe it's pandoc's problem not mine. The HTML tags need to be at the top-level of the scene's hierarchy, not nested beneath other headings. I suggest you create a dedicated scene for Copyright and a dedicated scene for Acknowledgements
