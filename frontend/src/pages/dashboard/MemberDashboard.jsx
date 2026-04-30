import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Gauge,
  ListTodo,
  SlidersHorizontal
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getTasksRequest, updateTaskStatusRequest } from "../../api";
import { Alert, EmptyState, StatCard, StatusBadge } from "../../components";
import { TASK_STATUSES } from "../../constants";

const statusLabels = {
  [TASK_STATUSES.TODO]: "To do",
  [TASK_STATUSES.IN_PROGRESS]: "In progress",
  [TASK_STATUSES.DONE]: "Done"
};

const filters = [
  { label: "All", value: "ALL" },
  { label: "To do", value: TASK_STATUSES.TODO },
  { label: "In progress", value: TASK_STATUSES.IN_PROGRESS },
  { label: "Done", value: TASK_STATUSES.DONE }
];

function formatDueDate(dueDate) {
  if (!dueDate) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dueDate));
}

function isOverdue(task) {
  if (!task.dueDate || task.status === TASK_STATUSES.DONE) {
    return false;
  }

  return new Date(task.dueDate) < new Date();
}

function getTasksFromResponse(response) {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.tasks)) {
    return response.data.tasks;
  }

  return [];
}

export default function MemberDashboard() {
  const [tasks, setTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [error, setError] = useState("");

  const todoTasks = tasks.filter((task) => task.status === TASK_STATUSES.TODO).length;
  const activeTasks = tasks.filter((task) => task.status === TASK_STATUSES.IN_PROGRESS).length;
  const doneTasks = tasks.filter((task) => task.status === TASK_STATUSES.DONE).length;
  const overdueTasks = tasks.filter(isOverdue).length;
  const completionRate = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const statusSummary = [
    {
      label: "To do",
      value: todoTasks,
      color: "bg-slate-500"
    },
    {
      label: "In progress",
      value: activeTasks,
      color: "bg-amber-500"
    },
    {
      label: "Done",
      value: doneTasks,
      color: "bg-emerald-500"
    }
  ];
  const nextDueTask = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate && task.status !== TASK_STATUSES.DONE)
      .sort((firstTask, secondTask) => new Date(firstTask.dueDate) - new Date(secondTask.dueDate))[0];
  }, [tasks]);
  const filteredTasks = useMemo(() => {
    if (activeFilter === "ALL") {
      return tasks;
    }

    return tasks.filter((task) => task.status === activeFilter);
  }, [activeFilter, tasks]);

  async function loadTasks() {
    setError("");
    setIsLoading(true);

    try {
      const response = await getTasksRequest();
      setTasks(getTasksFromResponse(response));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your tasks.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleStatusChange(taskId, status) {
    setError("");
    setUpdatingTaskId(taskId);

    try {
      const response = await updateTaskStatusRequest(taskId, status);
      const updatedTask = response.data?.task;

      if (updatedTask) {
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === taskId ? updatedTask : task))
        );
      } else {
        await loadTasks();
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update task status.");
    } finally {
      setUpdatingTaskId("");
    }
  }

  return (
    <main className="page-shell">
      <section className="page-container">
        <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid gap-0 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="px-5 py-6">
              <p className="eyebrow">Member workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">My assigned tasks</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Review your workload and keep task progress current for the team.
              </p>
            </div>
            <div className="border-t border-slate-200 bg-slate-950 px-5 py-6 text-white lg:border-l lg:border-t-0">
              <p className="text-sm text-slate-300">Personal completion</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-semibold">{completionRate}%</span>
                <span className="pb-1 text-sm text-slate-300">{doneTasks} of {tasks.length} tasks</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={ClipboardList} label="Assigned" value={tasks.length} tone="blue" />
          <StatCard icon={Clock3} label="In progress" value={activeTasks} tone="amber" />
          <StatCard icon={CheckCircle2} label="Done" value={doneTasks} tone="emerald" />
          <StatCard icon={CalendarDays} label="Overdue" value={overdueTasks} tone="rose" />
        </div>

        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>

        <section className="panel">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Task queue</h2>
              <p className="mt-1 text-sm text-slate-600">Update status as work moves forward.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const isActive = activeFilter === filter.value;

                return (
                  <button
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-950 text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                  >
                    {filter.value === "ALL" ? <SlidersHorizontal size={15} /> : null}
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="p-5">
              {isLoading ? (
                <div className="rounded-md border border-dashed border-slate-300 p-6 text-sm text-slate-600">
                  Loading your assigned tasks...
                </div>
              ) : tasks.length === 0 ? (
                <EmptyState
                  icon={ListTodo}
                  title="No tasks assigned yet"
                  message="When an admin assigns work to you, it will appear here."
                />
              ) : filteredTasks.length === 0 ? (
                <EmptyState
                  icon={ListTodo}
                  title="No matching tasks"
                  message="Try a different status filter."
                />
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={task.id}>
                      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_16rem]">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 md:border-b-0 md:border-r">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-blue-700">
                                {task.project?.name || "Project"}
                              </p>
                              <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-950">{task.title}</h3>
                            </div>
                            <StatusBadge status={task.status} />
                          </div>
                          <p className="mt-4 text-sm leading-6 text-slate-600">
                            {task.description || "No description provided."}
                          </p>
                        </div>

                        <div className="p-4">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays size={16} />
                              <span>{formatDueDate(task.dueDate)}</span>
                            </div>
                            {isOverdue(task) ? (
                              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                                Overdue
                              </span>
                            ) : null}
                          </div>

                          <label className="field-label" htmlFor={`status-${task.id}`}>
                            Status
                          </label>
                          <select
                            className="form-input"
                            id={`status-${task.id}`}
                            value={task.status}
                            onChange={(event) => handleStatusChange(task.id, event.target.value)}
                            disabled={updatingTaskId === task.id}
                          >
                            {Object.values(TASK_STATUSES).map((status) => (
                              <option key={status} value={status}>
                                {statusLabels[status]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {!isLoading && tasks.length > 0 ? (
              <aside className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-blue-700 ring-1 ring-slate-200">
                    <Gauge size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">Workload</h3>
                    <p className="text-sm text-slate-600">{tasks.length} assigned task{tasks.length === 1 ? "" : "s"}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Completion</span>
                    <span className="font-semibold text-slate-950">{completionRate}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {statusSummary.map((item) => (
                    <div className="flex items-center justify-between gap-3 text-sm" key={item.label}>
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-semibold text-slate-950">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Next due</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {nextDueTask ? nextDueTask.title : "No open due dates"}
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    {nextDueTask ? formatDueDate(nextDueTask.dueDate) : "All clear"}
                  </p>
                </div>
              </aside>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
