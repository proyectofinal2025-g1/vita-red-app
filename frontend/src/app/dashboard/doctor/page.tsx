import DoctorProfilePage from './profile/page'
import DoctorAppointmentsPage from './appointments/page';

export default function DoctorDashboardPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DoctorProfilePage />
            <DoctorAppointmentsPage />
        </div>
    );
}