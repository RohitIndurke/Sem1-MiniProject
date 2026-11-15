import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, ArrowLeft, FileText } from "lucide-react";

export function UploadResumeCard({ onBack, onFileUploaded, analyzing, error }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelectFile = (f) => {
    if (!f) return;
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      alert("Please upload a PDF document.");
      return;
    }
    setFile(f);
    if (onFileUploaded) {
      onFileUploaded(f);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 transition-all">
      {/* Header with Title and ← Back */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Upload Your Current Resume
        </h2>
        <button
          type="button"
          onClick={onBack}
          disabled={analyzing}
          className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
        >
          <span>← Back</span>
        </button>
      </div>

      {/* VIEW A: Analyzing Screen (Image 4) */}
      {analyzing ? (
        <div className="py-14 sm:py-16 flex flex-col items-center justify-center text-center">
          {/* Dual-color circular loader */}
          <div className="relative size-16">
            <div className="size-16 rounded-full border-4 border-slate-100 border-t-blue-600 border-r-pink-300 animate-spin" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-6 tracking-tight">
            Analyzing Resume with AI...
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
            Extracting skills, experience, and contact information...
          </p>
        </div>
      ) : (
        /* VIEW B: Upload Dropzone (Image 3) */
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 sm:p-12 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
              dragging
                ? "border-blue-500 bg-blue-50/30"
                : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
            }`}
          >
            {/* Blue circle cloud badge */}
            <div className="size-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <UploadCloud className="size-7 stroke-[1.8]" />
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-1">
              Drag and drop your resume here
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Supports PDF, DOC, DOCX (Max 5MB)
            </p>

            {/* Browse Files Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              Browse Files
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => handleSelectFile(e.target.files?.[0])}
            />
          </div>

          {/* Selected File Feedback */}
          {file && (
            <div className="mt-4 p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <FileText className="size-4 text-blue-600" />
                <span className="font-semibold text-slate-800">{file.name}</span>
                <span className="text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => onFileUploaded(file)}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Analyze Now →
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

