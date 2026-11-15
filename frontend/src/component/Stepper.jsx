import { Check } from "lucide-react";

export function Stepper({ currentStep }) {
  const steps = [
    { number: 1, label: "Target Job" },
    { number: 2, label: "Upload & Analyze" },
    { number: 3, label: "Review Info" },
    { number: 4, label: "Generated Resume" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div key={step.number} className="flex-1 flex items-center">
              {/* Step Icon & Label */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div
                  className={`size-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? "bg-blue-600 text-white"
                      : isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 font-semibold"
                  }`}
                >
                  {isCompleted ? <Check className="size-3.5 stroke-[3]" /> : step.number}
                </div>

                <span
                  className={`text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    isActive
                      ? "font-bold text-slate-900"
                      : isCompleted
                      ? "font-medium text-slate-700"
                      : "font-normal text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line (except after last step) */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-3 sm:mx-6 transition-all ${
                    isCompleted ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

