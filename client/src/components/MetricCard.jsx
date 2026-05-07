const tones = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700'
};

export default function MetricCard({ icon: Icon, label, value, tone = 'default' }) {
  return (
    <div className="panel flex items-center gap-4 p-5">
      <div className={`grid h-11 w-11 place-items-center rounded-md ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-950">{value}</p>
      </div>
    </div>
  );
}
