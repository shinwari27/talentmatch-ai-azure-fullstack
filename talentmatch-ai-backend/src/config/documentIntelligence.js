const DocumentIntelligence = require("@azure-rest/ai-document-intelligence").default;
const { AzureKeyCredential } = require("@azure/core-auth");

let client;

function getDocumentIntelligenceClient() {
  if (!client) {
    client = DocumentIntelligence(
      process.env.DOCUMENT_INTELLIGENCE_ENDPOINT,
      new AzureKeyCredential(process.env.DOCUMENT_INTELLIGENCE_KEY)
    );
  }
  return client;
}

module.exports = { getDocumentIntelligenceClient };
