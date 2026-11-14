import type { OkfIssue } from "@/lib/okf/types";

import { ErrorState } from "./error-state";

/** Knowledge files that failed validation. Visible so they get fixed, not hidden. */
export function IssueList({ issues }: { issues: OkfIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <ErrorState
      title={`${issues.length} knowledge file problem${issues.length === 1 ? "" : "s"}`}
      description="These files are excluded until they pass validation. See docs/data-contract.md."
      action={
        <ul className="space-y-1 font-mono text-xs">
          {issues.map((issue, index) => (
            <li key={`${issue.filePath}-${issue.path}-${index}`} className="break-words text-ink-muted">
              <span className="text-ink">{issue.filePath}</span>
              {issue.path ? ` · ${issue.path}` : ""} · {issue.message}
            </li>
          ))}
        </ul>
      }
    />
  );
}
