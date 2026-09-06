import { useRef, useState } from "react";

/**
 * Equivalent of the file_uploader + "Parse resume" button row in main.py.
 */
export default function UploadSection({ onParse, isParsing }) {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  return (
    <div className="upload-row">
      <div className="upload-col file-drop">
        <label>Upload resume</label>
        <div className="file-drop-zone">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>
      <div className="action-col">
        <button
          className="btn btn-primary"
          disabled={!file || isParsing}
          onClick={() => file && onParse(file)}
        >
          {isParsing ? "Parsing..." : "Parse resume"}
        </button>
      </div>
    </div>
  );
}
