export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 animate-pulse" aria-live="polite" aria-busy="true">
      <div className="h-8 w-48 bg-b2 rounded mb-6" />
      <div className="space-y-4 max-w-2xl">
        <div className="h-24 bg-s1 rounded-lg" />
        <div className="h-24 bg-s1 rounded-lg" />
        <div className="h-32 bg-s1 rounded-lg" />
      </div>
    </div>
  )
}
