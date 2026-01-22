interface StatCardProps {
  title: string
  value: number
  onClick?: () => void
  active?: boolean
}

export default function StatCard({ title, value, onClick, active }: StatCardProps) {
  return (
    <div onClick={onClick} className={`rounded-2xl p-6 hover:border-b-emerald-700 shadow-sm cursor-pointer transition
    ${active ? "bg-emerald-700 text-white" : "bg-emerald-100 hover:bg-slate-50"}`}>
      <p className={`text-sm ${active ? "text-blue-100" : "text-slate-500"}`}>{title}</p>
      <p className={`text-3xl font-bold ${active ? "text-white" : "text-slate-800"}`}>{value}</p>
    </div>
  )
}