import { CalendarPlus } from 'lucide-react';
import { useState } from 'react';

const initialTask = {
  title: '',
  description: '',
  assignedTo: '',
  deadline: ''
};

export default function TaskForm({ project, createTask }) {
  const [form, setForm] = useState(initialTask);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    await createTask({ ...form, projectId: project._id });
    setForm(initialTask);
  }

  return (
    <form className="panel grid gap-4 p-5 md:grid-cols-2" onSubmit={submit}>
      <div className="md:col-span-2">
        <h2 className="section-title">Create task for {project.name}</h2>
      </div>
      <label className="field">
        <span>Title</span>
        <input name="title" onChange={updateField} required value={form.title} />
      </label>
      <label className="field">
        <span>Assignee</span>
        <select name="assignedTo" onChange={updateField} required value={form.assignedTo}>
          <option value="">Select member</option>
          {project.members.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Deadline</span>
        <input name="deadline" onChange={updateField} required type="date" value={form.deadline} />
      </label>
      <label className="field md:col-span-2">
        <span>Description</span>
        <textarea name="description" onChange={updateField} rows="3" value={form.description} />
      </label>
      <div className="md:col-span-2">
        <button className="primary-btn" type="submit">
          <CalendarPlus className="h-4 w-4" />
          Create task
        </button>
      </div>
    </form>
  );
}
