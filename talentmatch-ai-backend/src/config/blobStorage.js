const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

let containerClientPromise;

/**
 * Same one-time-setup, reuse-everywhere pattern as db.js. Building a
 * StorageSharedKeyCredential from the account name/key is the standard
 * approach for a Node backend talking to Blob Storage directly (as opposed
 * to the frontend uploading straight to Blob with a SAS token, which is a
 * different, more complex pattern not needed at this project's scale).
 */
function getResumeContainerClient() {
  if (!containerClientPromise) {
    const credential = new StorageSharedKeyCredential(
      process.env.STORAGE_ACCOUNT_NAME,
      process.env.STORAGE_ACCOUNT_KEY
    );
    const blobServiceClient = new BlobServiceClient(
      `https://${process.env.STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
      credential
    );
    const containerClient = blobServiceClient.getContainerClient(
      process.env.BLOB_CONTAINER_RESUMES || "resumes"
    );
    containerClientPromise = Promise.resolve(containerClient);
  }
  return containerClientPromise;
}

module.exports = { getResumeContainerClient };
