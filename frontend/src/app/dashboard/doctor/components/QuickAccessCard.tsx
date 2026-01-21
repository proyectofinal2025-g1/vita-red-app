import Link from "next/link"

interface QuickAccessCardProps {
  title: string
  description: string
  href: string
}

export default function QuickAccessCard({
  title,
  description,
  href,
}: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className="bg-blue-100 rounded-2xl p-6 border-b-blue-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all block hover:bg-blue-50"
    >
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </Link>
  )
}
