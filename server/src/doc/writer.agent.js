const SECTION_MARKERS = {
  "API Changes":           ["<!-- TZYLO:API_START -->",  "<!-- TZYLO:API_END -->"],
  "Database Changes":      ["<!-- TZYLO:DB_START -->",   "<!-- TZYLO:DB_END -->"],
  "Architecture":          ["<!-- TZYLO:ARCH_START -->", "<!-- TZYLO:ARCH_END -->"],
  "Breaking Changes":      ["<!-- TZYLO:BREAK_START -->","<!-- TZYLO:BREAK_END -->"],
  "Dependencies":          ["<!-- TZYLO:DEP_START -->",  "<!-- TZYLO:DEP_END -->"],
  "Configuration":         ["<!-- TZYLO:CONF_START -->", "<!-- TZYLO:CONF_END -->"],
  "Bug Fixes":             ["<!-- TZYLO:FIX_START -->",  "<!-- TZYLO:FIX_END -->"],
  "General Notes":         ["<!-- TZYLO:GEN_START -->",  "<!-- TZYLO:GEN_END -->"],
}

const formatContent = (contentArray, prNumber) => {
  return contentArray
    .map(item => `- [PR #${prNumber}] ${item}`)
    .join("\n");
};

const insertIntoSection = (doc, startMarker, endMarker, newContent) => {
  const startIndex = doc.indexOf(startMarker);
  const endIndex = doc.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(`Markers not found: ${startMarker}`);
  }

  const before = doc.slice(0, startIndex + startMarker.length);
  const after = doc.slice(endIndex);

  const existingContent = doc.slice(
    startIndex + startMarker.length,
    endIndex
  ).trim();

  const combinedContent = existingContent
    ? `${existingContent}\n${newContent}`
    : newContent;

  return `${before}\n${combinedContent}\n${after}`;
};

export const updateTzyloDoc = ({ existingDoc, sections, prNumber }) => {
  let updatedDoc = existingDoc;

  for (const section of sections) {
    const markers = SECTION_MARKERS[section.title];

    if (!markers) {
      // skip unknown sections (safety)
      continue;
    }

    const [startMarker, endMarker] = markers;

    const formatted = formatContent(section.content, prNumber);

    updatedDoc = insertIntoSection(
      updatedDoc,
      startMarker,
      endMarker,
      formatted
    );
  }

  return updatedDoc;
};