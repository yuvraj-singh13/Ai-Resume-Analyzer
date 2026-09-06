import path from "node:path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

/**
 * Walks a parsed word/header*.xml or word/footer*.xml XML tree and
 * collects every <w:t> text run, joined the same way python-docx's
 * `paragraph.text` does for header/footer paragraphs.
 */
function collectTextRuns(node, out) {
  if (node == null) return;
  if (Array.isArray(node)) {
    node.forEach((child) => collectTextRuns(child, out));
    return;
  }
  if (typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    if (key === "w:t") {
      const text = typeof value === "object" ? value["#text"] ?? "" : String(value ?? "");
      if (text.trim()) out.push(text);
    } else if (key === "w:p") {
      // paragraph boundary - collect its runs then mark a break
      const runs = [];
      collectTextRuns(value, runs);
      if (runs.length) out.push(runs.join(""));
    } else if (typeof value === "object") {
      collectTextRuns(value, out);
    }
  }
}

async function extractHeaderFooterText(fileBuffer) {
  const zip = await JSZip.loadAsync(fileBuffer);
  const parser = new XMLParser({ ignoreAttributes: false });
  const parts = [];

  const headerFooterFiles = Object.keys(zip.files).filter((name) =>
    /^word\/(header|footer)\d*\.xml$/.test(name)
  );

  for (const fileName of headerFooterFiles) {
    const xml = await zip.files[fileName].async("string");
    const parsed = parser.parse(xml);
    const paragraphs = [];
    collectTextRuns(parsed, paragraphs);
    parts.push(...paragraphs.filter((p) => p.trim()));
  }

  return parts;
}

/**
 * DOCX extraction that mirrors parser.py's behaviour: paragraphs, tables
 * (cells joined with " | "), and header/footer paragraphs.
 */
async function loadDocxText(fileBuffer) {
  // mammoth's raw text extraction covers body paragraphs and table cell
  // text (each cell/paragraph on its own line), matching python-docx's
  // paragraph + table extraction.
  const { value: bodyText } = await mammoth.extractRawText({ buffer: fileBuffer });
  const bodyLines = bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const headerFooterLines = await extractHeaderFooterText(fileBuffer);

  return [...bodyLines, ...headerFooterLines].join("\n");
}

/**
 * PDF extraction that mirrors parser.py's PyPDFLoader usage: every page's
 * text content joined with newlines.
 */
async function loadPdfText(fileBuffer) {
  const data = await pdfParse(fileBuffer);
  return data.text;
}

/**
 * Equivalent of load_resume_text_from_path / load_resume_text_from_bytes
 * in parser.py. Accepts a Buffer plus the original filename so it can pick
 * the right extraction path from the extension, exactly like the Python
 * suffix check.
 */
export async function loadResumeTextFromBuffer(fileBuffer, originalName) {
  const suffix = path.extname(originalName || "").toLowerCase();

  if (suffix === ".docx") {
    return loadDocxText(fileBuffer);
  }

  if (suffix !== ".pdf") {
    throw new Error("Unsupported resume format. Please upload a PDF or DOCX file.");
  }

  return loadPdfText(fileBuffer);
}
