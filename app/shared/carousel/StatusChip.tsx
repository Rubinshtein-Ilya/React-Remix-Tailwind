function StatusChip({ title }: { title: string }) {
  return (
    <div className="px-2 sm:px-3 py-1 rounded-full uppercase text-[10px] sm:text-sm text-[var(--text-secondary)] bg-[var(--bg-dark)] whitespace-nowrap">
      {title}
    </div>
  );
}

export default StatusChip;
