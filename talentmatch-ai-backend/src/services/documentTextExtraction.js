const { getDocumentIntelligenceClient } = require("../config/documentIntelligence");
const { getLongRunningPoller, isUnexpected } = require("@azure-rest/ai-document-intelligence");

/**
 * Uses Document Intelligence's prebuilt "read" model — this is OCR-quality
 * text extraction (works on both digital and scanned/image PDFs), not a
 * resume-specific semantic model. Azure doesn't offer a true "understand
 * this is a resume and pull out the skills section" model out of the box;
 * that would require either Azure OpenAI on top of this text, or a custom
 * Document Intelligence model trained on a labeled set of sample resumes
 * (unrealistic to build and maintain for a project at this scale). The
 * structured-field extraction that happens after this (resumeExtractor.js)
 * is deliberately rule-based pattern matching over this raw text, not ML.
 */
async function extractTextFromResume(fileBuffer, mimeType) {
  const client = getDocumentIntelligenceClient();

  const initialResponse = await client
    .path("/documentModels/{modelId}:analyze", "prebuilt-read")
    .post({
      contentType: mimeType,
      body: fileBuffer,
    });

  if (isUnexpected(initialResponse)) {
    throw new Error(
      `Document Intelligence request failed: ${initialResponse.body?.error?.message || "unknown error"}`
    );
  }

  const poller = getLongRunningPoller(client, initialResponse);
  const result = await poller.pollUntilDone();

  const content = result.body?.analyzeResult?.content;
  if (!content) {
    throw new Error("Document Intelligence returned no readable text from this file.");
  }

  return content;
}

module.exports = { extractTextFromResume };
