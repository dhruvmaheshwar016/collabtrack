import { CalendarClock } from 'lucide-react';

const statuses = ['Pending', 'In Progress', 'Completed'];
const statusStyles = {
  Pending: 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-cyan-100 text-cyan-800',
  Completed: 'bg-emerald-100 text-emerald-800'
};

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export default function TaskBoard({ tasks, updateTaskStatus, loading }) {
  if (loading) {
    return <div className="panel p-6 text-slate-600">Loading tasks...</div>;
  }

  if (!tasks.length) {
    return <div className="panel p-6 text-slate-600">No tasks match the current view.</div>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {statuses.map((status) => (
        <section className="panel p-4" key={status}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">{status}</h2>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{tasks.filter((task) => task.status === status).length}</span>
          </div>

          <div className="space-y-3">
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm" key={task._id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">{task.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{task.projectId?.name}</p>
                    </div>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusStyles[task.status]}`}>{task.status}</span>
                  </div>
                  {task.description && <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p>}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                    <span>{task.assignedTo?.name}</span>
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-4 w-4" />
                      {formatDate(task.deadline)}
                    </span>
                  </div>
                  <select className="control mt-4" onChange={(event) => updateTaskStatus(task._id, event.target.value)} value={task.status}>
                    {statuses.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
