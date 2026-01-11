import { DoctorProfile } from '@/app/dashboard/doctor/types';

interface Props {
    doctor: DoctorProfile;
}

export default function DoctorProfileCard({ doctor }: Props) {
    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Mi perfil profesional
            </h2>

            <div className="space-y-2 text-sm text-gray-600">
                <p>
                    <span className="font-medium">Nombre:</span>{' '}
                    {doctor.first_name} {doctor.last_name}
                </p>
                <p>
                    <span className="font-medium">Email:</span> {doctor.email}
                </p>
                <p>
                    <span className="font-medium">Especialidad:</span> {' '}
                    {doctor.specialty.name}
                </p>
                <p>
                    <span className="font-medium">Matrícula:</span> {' '}
                    {doctor.licence_number}
                </p>
            </div>
        </div>
    );
}