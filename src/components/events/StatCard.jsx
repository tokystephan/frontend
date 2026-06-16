export default function StatCard({ label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800',
  };
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color]} inline-block px-3 py-1 rounded-full mt-2`}>
        {value}
      </p>
    </div>
  );
}