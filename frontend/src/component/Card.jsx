import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CardDemo() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !text.trim()) return;

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);   // matches FastAPI: file: UploadFile
      formData.append("jd", text);     // matches FastAPI: jd: str

      const res = await fetch("http://localhost:8000/api/v1/ats/analyze", {
        method: "POST",
        body: formData,
        // ⚠️ Do NOT set Content-Type – browser sets it with boundary automatically
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Server ${res.status}: ${detail}`);
      }

      const data = await res.json();
      console.log("✅ Result:", data);
      setResult(data);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">ATS Resume Analyzer</CardTitle>
        <CardDescription>
          Upload your resume (PDF) and paste the job description, then click{" "}
          <strong>Next</strong>.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} method="post">
        <CardContent className="flex flex-col gap-5">
          {/* PDF Upload */}
          <div className="grid gap-2">
            <Label>Resume (PDF)</Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={[
                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-colors select-none",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
              ].join(" ")}
            >
              {file ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground">Click to replace</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm text-muted-foreground">
                    Drag & drop or{" "}
                    <span className="text-primary underline underline-offset-2">browse</span>
                  </span>
                  <span className="text-xs text-muted-foreground">PDF only</span>
                </>
              )}
            </div>

            {/* Hidden real file input */}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                // Reset so the same file can be re-selected
                e.target.value = "";
              }}
            />
          </div>

          {/* Job Description */}
          <div className="grid gap-2">
            <Label htmlFor="jd">Job Description</Label>
            <Textarea
              id="jd"
              placeholder="Paste the job description or requirements here…"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500 rounded-md bg-red-50 px-3 py-2 border border-red-200">
              ⚠️ {error}
            </p>
          )}

          {/* Success message */}
          {result && (
            <p className="text-sm text-green-700 rounded-md bg-green-50 px-3 py-2 border border-green-200">
              ✅ {result.message}
            </p>
          )}
        </CardContent>

        <CardFooter className="justify-end pt-2">
          <Button
            type="submit"
            disabled={!file || !text.trim() || loading}
            className="gap-2"
          >
            {loading ? "Uploading…" : "Next"}
            {!loading && (
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
