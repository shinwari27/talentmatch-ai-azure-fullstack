const multer = require("multer");

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Memory storage, not disk storage — the file buffer goes straight to Blob
 * Storage in the controller and is never written to the App Service's local
 * disk. That matters on Azure specifically: App Service instances can be
 * recycled or scaled at any time, and local disk writes aren't guaranteed
 * to persist or even be visible across instances.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Only PDF and DOCX files are supported."));
    }
    cb(null, true);
  },
});

module.exports = { uploadResumeMiddleware: upload.single("resume") };
