export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="panel flex min-h-48 flex-col items-center justify-center p-6 text-center">
      {Icon ? (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-600">
          <Icon size={22} />
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>
    </div>
  );
}
