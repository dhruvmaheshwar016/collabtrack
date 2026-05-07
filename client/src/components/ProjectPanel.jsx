import { Users } from 'lucide-react';

export default function ProjectPanel({ projects, selectedProject, setSelectedProject, selectedProjectData, users, isAdmin, addMember }) {
  const availableUsers = users.filter((user) => !selectedProjectData?.members?.some((member) => member._id === user._id));

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="section-title">Projects</h2>
        <span className="text-sm text-slate-500">{projects.length}</span>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <button className={`project-row ${selectedProject === project._id ? 'project-row-active' : ''}`} key={project._id} onClick={() => setSelectedProject(project._id)} type="button">
            <span className="font-semibold">{project.name}</span>
            <span className="text-xs text-slate-500">{project.members.length} members</span>
          </button>
        ))}

        {!projects.length && <p className="empty-state">No projects yet.</p>}
      </div>

      {selectedProjectData && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-700" />
            <h3 className="font-semibold">Team</h3>
          </div>
          <div className="space-y-2">
            {selectedProjectData.members.map((member) => (
              <div className="rounded-md bg-slate-50 px-3 py-2 text-sm" key={member._id}>
                <p className="font-medium">{member.name}</p>
                <p className="text-slate-500">{member.email}</p>
              </div>
            ))}
          </div>

          {isAdmin && (
            <select className="control mt-4" defaultValue="" onChange={(event) => addMember(event.target.value)}>
              <option value="" disabled>
                Add member
              </option>
              {availableUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
