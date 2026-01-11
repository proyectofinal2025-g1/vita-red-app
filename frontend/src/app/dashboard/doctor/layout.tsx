export default function DoctorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </section>
    );
}