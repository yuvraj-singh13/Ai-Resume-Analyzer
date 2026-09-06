import multer from "multer";

// In-memory storage: the uploaded file is used to extract text and then
// discarded, matching the original app's use of a temp file that is
// "always deleted" after parsing. Nothing is written to disk here.
const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

function fileFilter(req, file, cb) {
  const lower = file.originalname.toLowerCase();
  const ok = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!ok) {
    return cb(new Error("Unsupported resume format. Please upload a PDF or DOCX file."));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

export default upload;
