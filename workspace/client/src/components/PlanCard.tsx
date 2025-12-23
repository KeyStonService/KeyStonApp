import { useState } from "react";
import {
  Shield,
  Check,
  X,
  Play,
  RotateCcw,
  AlertTriangle,
  Server,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanCardData } from "@shared/types";

interface PlanCardProps {
  plan: PlanCardData;
  onApprove?: (planId: string) => void;
  onDryRun?: (planId: string) => void;
  onRollback?: (planId: string) => void;
}

const riskColors = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HIGH: "bg-red-100 text-red-800 border-red-200",
};

const modeLabels = {
  AUTO: "AUTO",
  PLAN_ONLY: "PLAN_ONLY",
  READ_ONLY: "READ_ONLY",
};

const rollbackLabels = {
  YES: { text: "YES", color: "text-green-600" },
  PARTIAL: { text: "PARTIAL", color: "text-yellow-600" },
  NO: { text: "NO", color: "text-red-600" },
};

export default function PlanCard({
  plan,
  onApprove,
  onDryRun,
  onRollback,
}: PlanCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleApprove = () => {
    if (plan.riskLevel === "HIGH" && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    onApprove?.(plan.id);
    setShowConfirm(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary-600" />
          <div>
            <h3 className="font-medium text-gray-900">{plan.title}</h3>
            {plan.description && (
              <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded border",
              riskColors[plan.riskLevel]
            )}
          >
            {plan.riskLevel}
          </span>
          <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 border border-gray-200">
            {modeLabels[plan.executionMode]}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Rollback:</span>
                <span
                  className={cn(
                    "font-medium",
                    rollbackLabels[plan.rollbackability].color
                  )}
                >
                  {rollbackLabels[plan.rollbackability].text}
                </span>
              </div>
            </div>

            {plan.requiredPermissions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Required Permissions
                </h4>
                <ul className="space-y-1">
                  {plan.requiredPermissions.map((perm, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      {perm.hasPermission ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span>{perm.scope}</span>
                      <span className="text-gray-400">- {perm.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.affectedResources.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Affected Resources
                </h4>
                <ul className="space-y-1">
                  {plan.affectedResources.map((resource, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Server className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{resource.platform}</span>
                      {resource.organization && (
                        <span>/ {resource.organization}</span>
                      )}
                      {resource.project && <span>/ {resource.project}</span>}
                      <span>/ {resource.resource}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {plan.steps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Steps</h4>
                <ol className="space-y-1">
                  {plan.steps.map((step) => (
                    <li
                      key={step.id}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-full text-xs font-medium">
                        {step.order}
                      </span>
                      <span>{step.description}</span>
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          step.status === "completed" &&
                            "bg-green-100 text-green-700",
                          step.status === "running" &&
                            "bg-blue-100 text-blue-700",
                          step.status === "failed" && "bg-red-100 text-red-700",
                          step.status === "pending" &&
                            "bg-gray-100 text-gray-600",
                          step.status === "skipped" &&
                            "bg-gray-100 text-gray-400"
                        )}
                      >
                        {step.status}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-4 bg-gray-50 border-t border-gray-100">
            {plan.canDryRun && (
              <button
                onClick={() => onDryRun?.(plan.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Play className="w-4 h-4" />
                Dry-run 預演
              </button>
            )}

            {plan.canApprove && (
              <>
                {showConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      High risk action. Confirm?
                    </span>
                    <button
                      onClick={handleApprove}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleApprove}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors",
                      plan.riskLevel === "HIGH"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-primary-600 hover:bg-primary-700"
                    )}
                  >
                    <Check className="w-4 h-4" />
                    同意操作
                  </button>
                )}
              </>
            )}

            {plan.canRollback && (
              <button
                onClick={() => onRollback?.(plan.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Rollback here
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
