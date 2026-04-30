import {
  CalendarDays,
  ClipboardCheck,
  FolderKanban,
  FolderPlus,
  ListChecks,
  Plus,
  Trash2,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createProjectRequest,
  createTaskRequest,
  deleteProjectRequest,
  deleteTaskRequest,
  getProjectsRequest,
  getTasksRequest,
  getUsersRequest
} from "../../api";
import { Alert, EmptyState, StatCard, StatusBadge } from "../../components";
import { TASK_STATUSES } from "../../constants";

const statusColumns = [
  {
    status: TASK_STATUSES.TODO,
    title: "To do",
    empty: "No queued tasks."
  },
  {
    status: TASK_STATUSES.IN_PROGRESS,
    title: "In progress",
    empty: "No active tasks."
  },
  {
    status: TASK_STATUSES.DONE,
    title: "Done",
    empty: "No completed tasks."
  }
];

function getCollection(response, key) {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.[key])) {
    return response.data[key];
  }

  return [];
}

function formatDueDate(dueDate) {
  if (!dueDate) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(dueDate));
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    projectId: "",
    assigneeId: ""
  });
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(
    () => Boolean(formData.title.trim() && formData.projectId && formData.assigneeId),
    [formData]
  );
  const canCreateProject = useMemo(() => Boolean(projectForm.name.trim()), [projectForm]);
  const completedTasks = tasks.filter((task) => task.status === TASK_STATUSES.DONE).length;
  const activeTasks = tasks.filter((task) => task.status === TASK_STATUSES.IN_PROGRESS).length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  async function loadDashboardData() {
    setError("");
    setIsLoading(true);

    try {
      const [usersResponse, projectsResponse, tasksResponse] = await Promise.all([
        getUsersRequest(),
        getProjectsRequest(),
        getTasksRequest()
      ]);

      const nextUsers = getCollection(usersResponse, "users");
      const nextProjects = getCollection(projectsResponse, "projects");
      const nextTasks = getCollection(tasksResponse, "tasks");

      setUsers(nextUsers);
      setProjects(nextProjects);
      setTasks(nextTasks);
      setFormData((currentFormData) => ({
        ...currentFormData,
        projectId: currentFormData.projectId || nextProjects[0]?.id || "",
        assigneeId: currentFormData.assigneeId || nextUsers[0]?.id || ""
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));
  }

  function handleProjectChange(event) {
    const { name, value } = event.target;

    setProjectForm((currentProjectForm) => ({
      ...currentProjectForm,
      [name]: value
    }));
  }

  function getProjectTaskCount(projectId) {
    return tasks.filter((task) => task.projectId === projectId).length;
  }

  function getUserTaskCount(userId) {
    return tasks.filter((task) => task.assigneeId === userId).length;
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsCreatingProject(true);

    try {
      const response = await createProjectRequest({
        name: projectForm.name.trim(),
        description: projectForm.description.trim()
      });
      const createdProject = response.data?.project;

      setSuccess("Project created successfully.");
      setProjectForm({
        name: "",
        description: ""
      });
      await loadDashboardData();

      if (createdProject?.id) {
        setFormData((currentFormData) => ({
          ...currentFormData,
          projectId: createdProject.id
        }));
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create project.");
    } finally {
      setIsCreatingProject(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await createTaskRequest({
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || null,
        projectId: formData.projectId,
        assigneeId: formData.assigneeId
      });

      setSuccess("Task created and assigned successfully.");
      setFormData((currentFormData) => ({
        ...currentFormData,
        title: "",
        description: "",
        dueDate: ""
      }));
      await loadDashboardData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTask(taskId, taskTitle) {
    const confirmed = window.confirm(`Delete task "${taskTitle}"? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(taskId);

    try {
      await deleteTaskRequest(taskId);
      setSuccess("Task deleted successfully.");
      await loadDashboardData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete task.");
    } finally {
      setDeletingId("");
    }
  }

  async function handleDeleteProject(projectId, projectName) {
    const taskCount = getProjectTaskCount(projectId);
    const confirmed = window.confirm(
      `Delete project "${projectName}"? This will also delete ${taskCount} related task${taskCount === 1 ? "" : "s"}.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(projectId);

    try {
      await deleteProjectRequest(projectId);
      setSuccess("Project deleted successfully.");
      setFormData((currentFormData) => ({
        ...currentFormData,
        projectId: currentFormData.projectId === projectId ? "" : currentFormData.projectId
      }));
      await loadDashboardData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete project.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="page-shell">
      <section className="page-container">
        <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-5 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Admin workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Team operations</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Create projects, assign work, and monitor task movement across the team.
              </p>
            </div>
            <div className="rounded-md bg-slate-950 px-5 py-4 text-white">
              <p className="text-sm text-slate-300">Completion rate</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-semibold">{completionRate}%</span>
                <span className="pb-1 text-sm text-slate-300">{completedTasks} of {tasks.length} tasks</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
                <div className="h-full rounded-full bg-blue-400" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Users" value={users.length} tone="blue" />
          <StatCard icon={FolderKanban} label="Projects" value={projects.length} tone="emerald" />
          <StatCard icon={ListChecks} label="Tasks" value={tasks.length} tone="amber" />
          <StatCard icon={ClipboardCheck} label="Completed" value={completedTasks} tone="slate" />
        </div>

        <div className="mb-4 space-y-3">
          <Alert variant="error">{error}</Alert>
          <Alert variant="success">{success}</Alert>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.35fr]">
          <div className="space-y-6">
            <section className="panel">
              <div className="panel-body">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <FolderPlus size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Create project</h2>
                    <p className="text-sm text-slate-600">Add a project before assigning related work.</p>
                  </div>
                </div>

                <form className="mt-5 space-y-4" onSubmit={handleCreateProject}>
                  <div>
                    <label className="field-label" htmlFor="projectName">
                      Project name
                    </label>
                    <input
                      className="form-input"
                      id="projectName"
                      name="name"
                      value={projectForm.name}
                      onChange={handleProjectChange}
                      placeholder="Website redesign"
                      required
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor="projectDescription">
                      Description
                    </label>
                    <textarea
                      className="form-input min-h-24 resize-none"
                      id="projectDescription"
                      name="description"
                      value={projectForm.description}
                      onChange={handleProjectChange}
                      placeholder="Scope, goals, or key notes"
                    />
                  </div>

                  <button
                    className="dark-button w-full"
                    type="submit"
                    disabled={isCreatingProject || !canCreateProject}
                  >
                    <Plus size={16} />
                    {isCreatingProject ? "Creating..." : "Create project"}
                  </button>
                </form>
              </div>
            </section>

            <section className="panel">
              <div className="panel-body">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <ListChecks size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Create task</h2>
                    <p className="text-sm text-slate-600">Assign work with context and a due date.</p>
                  </div>
                </div>

                <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="field-label" htmlFor="title">
                      Title
                    </label>
                    <input
                      className="form-input"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Prepare sprint board"
                      required
                    />
                  </div>

                  <div>
                    <label className="field-label" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      className="form-input min-h-24 resize-none"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Add acceptance notes or context"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="field-label" htmlFor="projectId">
                        Project
                      </label>
                      <select
                        className="form-input"
                        id="projectId"
                        name="projectId"
                        value={formData.projectId}
                        onChange={handleChange}
                        disabled={isLoading || projects.length === 0}
                        required
                      >
                        {projects.length === 0 ? <option value="">No projects available</option> : null}
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="field-label" htmlFor="dueDate">
                        Due date
                      </label>
                      <input
                        className="form-input"
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label" htmlFor="assigneeId">
                      Assign to
                    </label>
                    <select
                      className="form-input"
                      id="assigneeId"
                      name="assigneeId"
                      value={formData.assigneeId}
                      onChange={handleChange}
                      disabled={isLoading || users.length === 0}
                      required
                    >
                      {users.length === 0 ? <option value="">No users available</option> : null}
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="primary-button w-full"
                    type="submit"
                    disabled={isLoading || isSubmitting || !canSubmit}
                  >
                    <Plus size={16} />
                    {isSubmitting ? "Creating..." : "Create task"}
                  </button>
                </form>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="panel">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-950">Task pipeline</h2>
                <p className="mt-1 text-sm text-slate-600">Status grouped view for the current workload.</p>
              </div>

              {isLoading ? (
                <div className="p-5 text-sm text-slate-600">Loading dashboard data...</div>
              ) : tasks.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={ListChecks}
                    title="No tasks yet"
                    message="Create a task and assign it to a team member."
                  />
                </div>
              ) : (
                <div className="grid gap-0 lg:grid-cols-3">
                  {statusColumns.map((column) => {
                    const columnTasks = tasks.filter((task) => task.status === column.status);

                    return (
                      <div className="border-b border-slate-200 p-4 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0" key={column.status}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {columnTasks.length}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {columnTasks.length === 0 ? (
                            <p className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500">
                              {column.empty}
                            </p>
                          ) : (
                            columnTasks.map((task) => (
                              <article className="rounded-md border border-slate-200 bg-slate-50 p-3" key={task.id}>
                                <div className="mb-2 flex items-start justify-between gap-2">
                                  <p className="line-clamp-2 text-sm font-semibold text-slate-950">{task.title}</p>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <StatusBadge status={task.status} />
                                    <button
                                      aria-label={`Delete ${task.title}`}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                      type="button"
                                      onClick={() => handleDeleteTask(task.id, task.title)}
                                      disabled={deletingId === task.id}
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                                <p className="truncate text-xs text-slate-600">
                                  {task.project?.name || "Project"} - {task.assignee?.name || "Unassigned"}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                  <CalendarDays size={14} />
                                  <span>{formatDueDate(task.dueDate)}</span>
                                </div>
                              </article>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="panel">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-semibold text-slate-950">Projects</h2>
                </div>
                <div className="space-y-3 p-5">
                  {projects.length === 0 ? (
                    <p className="text-sm text-slate-600">No projects yet.</p>
                  ) : (
                    projects.map((project) => (
                      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3" key={project.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-950">{project.name}</p>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                              {project.description || "No description"}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                              {getProjectTaskCount(project.id)} tasks
                            </span>
                            <button
                              aria-label={`Delete ${project.name}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                              onClick={() => handleDeleteProject(project.id, project.name)}
                              disabled={deletingId === project.id}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="text-lg font-semibold text-slate-950">Team</h2>
                </div>
                <div className="space-y-3 p-5">
                  {users.map((user) => (
                    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3" key={user.id}>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-sm font-semibold text-blue-700 ring-1 ring-slate-200">
                          {user.name?.slice(0, 1).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-950">{user.name}</p>
                          <p className="truncate text-sm text-slate-600">{user.email}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                        {getUserTaskCount(user.id)} tasks
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
