interface IProps {
  title: string;
}

function FilterItemHeading({ title }: IProps) {
  return (
    <div className="text-xl text-[var(--text-secondary)] font-medium  uppercase w-full pb-2 border-b border-[var(--border-neutral)]">
      {title}
    </div>
  );
}

export default FilterItemHeading;
