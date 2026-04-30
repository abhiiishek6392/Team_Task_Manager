import { TASK_STATUSES } from "../../constants";

const statusStyles = {
  [TASK_STATUSES.TODO]: "bg-slate-100 text-slate-700 ring-slate-200",
  [TASK_STATUSES.IN_PROGRESS]: "bg-amber-50 text-amber-700 ring-amber-200",
  [TASK_STATUSES.DONE]: "bg-emerald-50 text-emerald-700 ring-emerald-200"
};

const labels = {
  [TASK_STATUSES.TODO]: "To do",
  [TASK_STATUSES.IN_PROGRESS]: "In progress",
  [TASK_STATUSES.DONE]: "Done"
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] || statusStyles[TASK_STATUSES.TODO]
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
