export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {children}
      </div>
    </div>
  )
}
