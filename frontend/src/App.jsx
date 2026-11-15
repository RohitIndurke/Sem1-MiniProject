import { useState, useEffect } from "react";
import { AuthCard } from "./component/AuthCard";
import { Stepper } from "./component/Stepper";
import { TargetJobCard } from "./component/TargetJobCard";
import { UploadResumeCard } from "./component/UploadResumeCard";
import { ReviewInfoCard } from "./component/ReviewInfoCard";
import { GeneratedResumeCard } from "./component/GeneratedResumeCard";
import { LogOut } from "lucide-react";

export const App = () => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Stepper state: 1: Target Job, 2: Upload & Analyze, 3: Review Info, 4: Generated Resume
  const [currentStep, setCurrentStep] = useState(1);

  // Workflow data
  const [jdText, setJdText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Check saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ats_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse saved user:", e);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ats_user");
    setUser(null);
    setCurrentStep(1);
    setJdText("");
    setUploadedFile(null);
    setAnalysisResult(null);
  };

  // Step 2: Handle Upload & AI Analysis
  const handleStartAnalysis = async (file) => {
    if (!file || !jdText.trim()) return;

    setUploadedFile(file);
    setAnalysisError(null);
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jd", jdText);

    const startTime = Date.now();
    const MIN_SCAN_TIME = 3000; // Guaranteed 3-second AI analysis animation

    try {
      const fetchPromise = fetch("http://localhost:8000/api/v1/ats/analyze", {
        method: "POST",
        body: formData,
      });

      const [res] = await Promise.all([
        fetchPromise,
        new Promise((resolve) => setTimeout(resolve, MIN_SCAN_TIME)),
      ]);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setAnalysisResult(data.analysis);
      setCurrentStep(3); // Advance to Review Info
    } catch (err) {
      console.error("Upload & Analysis error:", err);
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_SCAN_TIME) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SCAN_TIME - elapsed));
      }
      setAnalysisError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResetWorkflow = () => {
    setCurrentStep(1);
    setJdText("");
    setUploadedFile(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="size-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-50 px-6 sm:px-12 py-3.5">
        <div className="w-full flex items-center justify-between">
          {/* Brand Wordmark */}
          <div className="flex items-center">
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              SiliconFriends
            </span>
          </div>

          {/* User Status / Actions */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700">
                <div className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="font-medium hidden sm:inline">
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Not signed in
            </div>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 w-full px-6 sm:px-12 py-8 flex flex-col justify-start">
        {!user ? (
          /* AUTH SCREEN */
          <div className="w-full flex flex-col items-center justify-center pt-8 sm:pt-14 space-y-4">
            <AuthCard onSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
            <button
              type="button"
              onClick={() => setUser({ name: "Guest User", email: "guest@siliconfriends.com" })}
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors underline underline-offset-4 cursor-pointer"
            >
              Skip login & continue as Guest →
            </button>
          </div>
        ) : (
          /* WORKFLOW WIZARD (Left-aligned matching reference screenshots) */
          <div className="w-full max-w-2xl flex flex-col space-y-4">
            {/* Top 4-Step Stepper */}
            <Stepper currentStep={currentStep} />

            {/* Step 1: Target Job */}
            {currentStep === 1 && (
              <TargetJobCard
                jdText={jdText}
                setJdText={setJdText}
                onContinue={() => setCurrentStep(2)}
              />
            )}

            {/* Step 2: Upload & Analyze */}
            {currentStep === 2 && (
              <UploadResumeCard
                onBack={() => setCurrentStep(1)}
                onFileUploaded={handleStartAnalysis}
                analyzing={analyzing}
                error={analysisError}
              />
            )}

            {/* Step 3: Review Info */}
            {currentStep === 3 && (
              <ReviewInfoCard
                analysis={analysisResult}
                filename={uploadedFile?.name || "resume.pdf"}
                onBack={() => setCurrentStep(2)}
                onContinue={() => setCurrentStep(4)}
              />
            )}

            {/* Step 4: Generated Resume */}
            {currentStep === 4 && (
              <GeneratedResumeCard
                analysis={analysisResult}
                jdText={jdText}
                onReset={handleResetWorkflow}
                onBack={() => setCurrentStep(3)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
