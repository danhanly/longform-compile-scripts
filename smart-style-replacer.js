/**
 * Escapes special characters in a string for use in a regular expression.
 * @param {string} string - The input string to escape.
 * @returns {string} - The escaped string.
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

async function compile(input, context) {
  const markerInput = context.optionValues["marker"]?.trim();
  const styleName = context.optionValues["styleName"]?.trim();

  // Validation: If marker or style name are missing, return input unchanged to prevent errors.
  if (!markerInput || !styleName) {
    console.warn("Smart Style Replacer: Marker or Style Name is missing. Skipping step.");
    return input;
  }
  
  // Dynamically build the Regex.
  // ^ = Start of line
  // escapeRegExp = Protects characters like '?' or '+' in the user's marker
  // \s+ = Requires one or more spaces after the marker
  // (.*)$ = Captures the rest of the line content
  const generatedRegex = new RegExp(`^${escapeRegExp(markerInput)}\\s+(.*)$`, "gm");

  // The Pandoc Fenced Div replacement.
  // It adds both the 'custom-style' attribute (for Word/DOCX) and a CSS class (for EPUB/HTML).
  const replacement = `::: {custom-style="${styleName}" .${styleName}}\n$1\n:::`;
  
  for (const scene of input) {
    if (scene.contents) {
      scene.contents = scene.contents.replace(generatedRegex, replacement);
    }
  }
  
  return input;
}

module.exports = {
  description: {
    name: "Smart Style Replacer",
    description: "Wraps text lines starting with a specific marker into a Pandoc custom-style block (Fenced Div). Ideal for chat logs, poetry, or special formatting.",
    availableKinds: ["Scene"],
    options: [
      {
        id: "marker",
        name: "Line Marker",
        description: "The short code at the start of the line (e.g. '>r' or '>l'). The script assumes there is at least one space after the marker.",
        type: "Text",
        default: ">r",
      },
      {
        id: "styleName",
        name: "Style Name (Word & CSS)",
        description: "The name of the style to apply. Must match a style in your Reference Doc (for Word) and a class in your CSS (for EPUB). Example: 'RightAligned'.",
        type: "Text",
        default: "RightAligned",
      },
    ],
  },
  compile: compile,
};