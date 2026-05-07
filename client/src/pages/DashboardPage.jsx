import { ClipboardList, FolderKanban, LogOut, Plus, Search, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import api, { getApiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import MetricCard from '../components/MetricCard.jsx';
import ProjectPanel from '../components/ProjectPanel.jsx';
import TaskBoard from '../components/TaskBoard.jsx';
import TaskForm from '../components/TaskForm.jsx';

export default function DashboardPage() {
  const { user, isAdmin, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 });
  const [selectedProject, setSelectedProject] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const selectedProjectData = useMemo(() => projects.find((project) => project._id === selectedProject), [projects, selectedProject]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (selectedProject) params.set('projectId', selectedProject);
      if (status) params.set('status', status);
      if (search) params.set('search', search);

      const requests = [
        api.get('/projects'),
        api.get(`/tasks${params.toString() ? `?${params.toString()}` : ''}`),
        api.get('/tasks/dashboard/summary')
      ];

      if (isAdmin) {
        requests.push(api.get('/users'));
      }

      const [projectResponse, taskResponse, summaryResponse, userResponse] = await Promise.all(requests);
      setProjects(projectResponse.data.projects);
      setTasks(taskResponse.data.tasks);
      setSummary(summaryResponse.data);

      if (userResponse) {
        setUsers(userResponse.data.users);
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, search, selectedProject, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function createProject(event) {
    event.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/projects', projectForm);
      setProjects((current) => [data.project, ...current]);
      setSelectedProject(data.project._id);
      setProjectForm({ name: '', description: '' });
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function addMember(userId) {
    if (!selectedProject || !userId) return;

    try {
      const { data } = await api.post(`/projects/${selectedProject}/add-member`, { userId });
      setProjects((current) => current.map((project) => (project._id === data.project._id ? data.project : project)));
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function createTask(payload) {
    try {
      await api.post('/tasks', payload);
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  }

  async function updateTaskStatus(taskId, nextStatus) {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status: nextStatus });
      setTasks((current) => current.map((task) => (task._id === taskId ? data.task : task)));
      const summaryResponse = await api.get('/tasks/dashboard/summary');
      setSummary(summaryResponse.data);
    } catch (err) {
      setError(getApiError(err));
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    loadData();
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-teal-700">CollabTrack</p>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{user.role}</span>
            <button className="ghost-btn" onClick={logout} type="button">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {error && <p className="alert">{error}</p>}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard icon={ClipboardList} label="Total tasks" value={summary.totalTasks} />
          <MetricCard icon={FolderKanban} label="Completed" value={summary.completedTasks} tone="success" />
          <MetricCard icon={Plus} label="Pending" value={summary.pendingTasks} tone="warning" />
          <MetricCard icon={Users} label="Overdue" value={summary.overdueTasks} tone="danger" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6">
            {isAdmin && (
              <form className="panel space-y-4 p-5" onSubmit={createProject}>
                <h2 className="section-title">New project</h2>
                <label className="field">
                  <span>Name</span>
                  <input name="name" onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} required value={projectForm.name} />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea name="description" onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} rows="3" value={projectForm.description} />
                </label>
                <button className="primary-btn" type="submit">
                  <Plus className="h-4 w-4" />
                  Create project
                </button>
              </form>
            )}

            <ProjectPanel
              addMember={addMember}
              isAdmin={isAdmin}
              projects={projects}
              selectedProject={selectedProject}
              selectedProjectData={selectedProjectData}
              setSelectedProject={setSelectedProject}
              users={users}
            />
          </aside>

          <section className="space-y-6">
            <div className="panel p-5">
              <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
                <form className="relative" onSubmit={submitSearch}>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input className="search-input" onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" value={search} />
                </form>
                <select className="control" onChange={(event) => setStatus(event.target.value)} value={status}>
                  <option value="">All statuses</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <select className="control" onChange={(event) => setSelectedProject(event.target.value)} value={selectedProject}>
                  <option value="">All projects</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isAdmin && selectedProjectData && (
              <TaskForm createTask={createTask} project={selectedProjectData} />
            )}

            <TaskBoard loading={loading} tasks={tasks} updateTaskStatus={updateTaskStatus} />
          </section>
        </div>
      </section>
    </main>
  );
}
