import Link from "next/link"

interface MedicalRecord {
  id: number
  patient: string
  date: string
  reason: string
}

export default function MedicalRecordsTable({
  records,
}: {
  records: MedicalRecord[]
}) {
  if (!records.length) {
    return (
      <div className="bg-white rounded-2xl p-6 border text-slate-500">
        No tenés registros médicos
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-emerald-100">
          <tr>
            <th className="px-4 py-3 text-left">Paciente</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Resumen</th>
            <th className="px-4 py-3">Acción</th>
          </tr>
        </thead>

        <tbody>
          {records.map(r => (
            <tr key={r.id} className="border-t hover:bg-slate-50">
              <td className="px-4 py-3">{r.patient}</td>
              <td className="px-4 py-3 text-center">{r.date}</td>
              <td className="px-4 py-3">{r.reason}</td>
              <td className="px-4 py-3 text-center">
                <Link
                  href={`/dashboard/doctor/medical-records/${r.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
