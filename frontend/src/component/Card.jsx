import { useRef, useState, useEffect } from "react";
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
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Check,
  Plus,
  Target,
  Cpu,
  Layers,
} from "lucide-react";

export function CardDemo() {
  const [step, setStep] = useState("input"); // 'input' | 'analyzing' | 'result'
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  // Analyzing state animation steps
  const [scanStep, setScanStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const scanMessages = [
    { text: "Parsing and extracting text from PDF resume...", detail: "Reading structure and formatting" },
    { text: "Identifying core technical skills & qualifications...", detail: "Analyzing tech stack and competencies" },
    { text: "Evaluating semantic relevance against Job Description...", detail: "Running TF-IDF & Cosine Similarity vector models" },
    { text: "Calculating final ATS compatibility score...", detail: "Generating recommendations and missing keywords" },
  ];

  // Handle 3-second analyzing progress animation
  useEffect(() => {
    if (step !== "analyzing") return;

    setProgress(5);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < scanMessages.length - 1 ? prev + 1 : prev));
    }, 750);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + 2.5;
      });
    }, 75);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [step]);

  const handleFile = (f) => {
    if (!f) return;
    const isPdf = f.type === "application/pdf" || f.name?.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Please upload a valid PDF document.");
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

  const handleReset = () => {
    setFile(null);
    setText("");
    setResult(null);
    setError(null);
    setStep("input");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !text.trim()) return;

    setError(null);
    setStep("analyzing");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jd", text);

    const startTime = Date.now();
    const MIN_ANALYSIS_TIME = 3000; // Guaranteed 3-second scanning animation

    try {
      const fetchPromise = fetch("http://localhost:8000/api/v1/ats/analyze", {
        method: "POST",
        body: formData,
      });

      const [res] = await Promise.all([
        fetchPromise,
        new Promise((resolve) => setTimeout(resolve, MIN_ANALYSIS_TIME)),
      ]);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setProgress(100);
      setResult(data);
      setStep("result");
    } catch (err) {
      console.error("❌ Upload error:", err);
      // Wait remaining time if error was instantaneous
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_ANALYSIS_TIME) {
        await new Promise((resolve) => setTimeout(resolve, MIN_ANALYSIS_TIME - elapsed));
      }
      setError(err.message || "Failed to analyze resume. Please try again.");
      setStep("input");
    }
  };

  const analysis = result?.analysis;

  // -------------------------------------------------------------
  // VIEW 1: 3-Second Analyzing Page
  // -------------------------------------------------------------
  if (step === "analyzing") {
    return (
      <Card className="w-full max-w-xl shadow-2xl border border-primary/20 bg-card/95 backdrop-blur">
        <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center space-y-6">
          {/* Animated Scanning Graphic */}
          <div className="relative size-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-60" />
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <div className="relative size-16 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
              <FileText className="size-8 text-primary animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
              <Sparkles className="size-5 text-primary animate-bounce" />
              Analyzing Resume Against JD
            </h3>
            <p className="text-sm font-medium text-primary transition-all duration-300">
              {scanMessages[scanStep]?.text}
            </p>
            <p className="text-xs text-muted-foreground">
              {scanMessages[scanStep]?.detail}
            </p>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full max-w-xs space-y-1.5">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border">
              <div
                className="h-full bg-primary transition-all duration-200 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
              <span>Scanning...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Evaluating skill alignment, semantic match, and ATS compatibility...
          </p>
        </CardContent>
      </Card>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: Results Page Dashboard
  // -------------------------------------------------------------
  if (step === "result" && analysis) {
    const scoreColorClass =
      analysis.score >= 75
        ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
        : analysis.score >= 50
        ? "text-blue-500 border-blue-500/30 bg-blue-500/10"
        : analysis.score >= 30
        ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
        : "text-rose-500 border-rose-500/30 bg-rose-500/10";

    const badgeColorClass =
      analysis.score >= 75
        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        : analysis.score >= 50
        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
        : analysis.score >= 30
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
        : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";

    return (
      <Card className="w-full max-w-3xl shadow-2xl border transition-all animate-in fade-in-50 duration-300">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("input")}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Button>
            <div>
              <CardTitle className="text-xl">ATS Evaluation Report</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-0.5 text-xs">
                <FileText className="size-3.5 text-primary" />
                <span className="font-medium text-foreground">{file?.name}</span>
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            New Scan
          </Button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Main Score Hero Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-xl border bg-muted/20">
            {/* Score Ring / Radial */}
            <div className="flex flex-col items-center justify-center text-center p-3">
              <div
                className={`size-28 rounded-full border-4 flex flex-col items-center justify-center shadow-sm ${scoreColorClass}`}
              >
                <span className="text-3xl font-extrabold tracking-tight">
                  {analysis.score}%
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                  ATS Score
                </span>
              </div>
              <span
                className={`mt-2.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${badgeColorClass}`}
              >
                {analysis.match_level}
              </span>
            </div>

            {/* Metric Highlights */}
            <div className="md:col-span-2 grid grid-cols-2 gap-3 content-center">
              <div className="p-3.5 rounded-lg border bg-card/60">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                  <Target className="size-3.5 text-primary" />
                  Semantic Match
                </div>
                <div className="text-xl font-bold text-foreground">
                  {analysis.similarity_score}%
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Contextual relevance to JD
                </p>
              </div>

              <div className="p-3.5 rounded-lg border bg-card/60">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                  <Layers className="size-3.5 text-primary" />
                  Skill Match
                </div>
                <div className="text-xl font-bold text-foreground">
                  {analysis.keyword_match_score}%
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Requirements covered
                </p>
              </div>

              <div className="p-3.5 rounded-lg border bg-card/60">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                  <CheckCircle2 className="size-3.5" />
                  Matching Skills
                </div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {analysis.total_matched}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Found in your resume
                </p>
              </div>

              <div className="p-3.5 rounded-lg border bg-card/60">
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                  <AlertCircle className="size-3.5" />
                  Missing Skills
                </div>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {analysis.total_missing}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Recommended additions
                </p>
              </div>
            </div>
          </div>

          {/* Skills Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Matching Skills */}
            <div className="rounded-xl border p-4 bg-card shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-4" />
                  Matching Skills & Keywords
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  {analysis.matching_keywords?.length || 0}
                </span>
              </div>

              {analysis.matching_keywords?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysis.matching_keywords.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 text-xs font-medium"
                    >
                      <Check className="size-3 text-emerald-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No matching technical skills detected between this resume and job description.
                </p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="rounded-xl border p-4 bg-card shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Plus className="size-4" />
                  Recommended Missing Skills
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                  {analysis.missing_keywords?.length || 0}
                </span>
              </div>

              {analysis.missing_keywords?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysis.missing_keywords.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 px-2.5 py-1 text-xs font-medium"
                    >
                      <Plus className="size-3 text-amber-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  Great job! Your resume covers all core keywords mentioned in the job description.
                </p>
              )}
            </div>
          </div>

          {/* Actionable Advice Box */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 flex items-start gap-3">
            <Cpu className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-foreground">ATS Optimization Tip:</span>
              <p className="text-muted-foreground leading-relaxed">
                Applicant Tracking Systems parse your resume for exact skill keywords. Integrating the missing keywords above into your project descriptions and experience sections can significantly elevate your ranking.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => setStep("input")} className="gap-2">
            <ArrowLeft className="size-4" />
            Edit Inputs
          </Button>
          <Button size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="size-4" />
            Analyze Another Resume
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: Input Form Page (Default)
  // -------------------------------------------------------------
  return (
    <Card className="w-full max-w-xl shadow-xl transition-all">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          ATS Resume Analyzer
        </CardTitle>
        <CardDescription>
          Upload your resume (PDF) and paste the job description to calculate your ATS match score.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} method="post">
        <CardContent className="flex flex-col gap-5">
          {/* PDF Upload */}
          <div className="grid gap-2">
            <Label className="font-semibold text-sm">Resume (PDF)</Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={[
                "flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-4 py-8 cursor-pointer transition-all duration-200 select-none",
                dragging
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-border hover:border-primary/60 hover:bg-muted/40",
              ].join(" ")}
            >
              {file ? (
                <>
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="size-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-semibold text-foreground block">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • Click to replace
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <UploadCloud className="size-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-foreground">
                      Drag & drop your resume, or{" "}
                      <span className="text-primary underline underline-offset-2 font-semibold">
                        browse
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      PDF format only (Max 10MB)
                    </span>
                  </div>
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
                e.target.value = "";
              }}
            />
          </div>

          {/* Job Description */}
          <div className="grid gap-2">
            <Label htmlFor="jd" className="font-semibold text-sm">
              Job Description
            </Label>
            <Textarea
              id="jd"
              placeholder="Paste the target job description or requirements here..."
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="resize-none leading-relaxed"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 rounded-lg bg-red-50 dark:bg-red-950/40 p-3 border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-end pt-2">
          <Button
            type="submit"
            disabled={!file || !text.trim()}
            size="lg"
            className="gap-2 px-6 shadow-md"
          >
            <Sparkles className="size-4" />
            Analyze Match
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
