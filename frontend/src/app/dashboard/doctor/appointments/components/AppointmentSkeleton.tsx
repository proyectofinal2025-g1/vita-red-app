export default function AppointmentSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow p-4 animate-pulse flex justify-between items-center">
            <div className="space-y-2 w-full">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
    );
}