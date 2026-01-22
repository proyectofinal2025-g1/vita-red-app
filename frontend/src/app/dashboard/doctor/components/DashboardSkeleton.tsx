export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-24 bg-slate-200 rounded-2xl" />

      <div className="grid grid-cols-3 gap-6">
        <div className="h-24 bg-slate-200 rounded-2xl" />
        <div className="h-24 bg-slate-200 rounded-2xl" />
        <div className="h-24 bg-slate-200 rounded-2xl" />
      </div>

      <div className="h-32 bg-slate-200 rounded-2xl" />

      <div className="grid grid-cols-2 gap-6">
        <div className="h-24 bg-slate-200 rounded-2xl" />
        <div className="h-24 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  )
}
