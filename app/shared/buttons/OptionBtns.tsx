interface IProps {
  options: Record<string, string | number>[];
  selectedValue: string | number;
  setSelectedValue: (value: string | number) => void;
}

const OptionBtns = ({ ...props }: IProps) => {
  const { options, selectedValue, setSelectedValue } = props;
  return (
    <div className="w-full flex  flex-wrap gap-1 sm:gap-4 pb-4 lg:pb-0">
      {setSelectedValue &&
        options.map((option: Record<string, string | number>) => (
          <div key={option.id}>
            <input
              type="radio"
              id={option.id as string}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => setSelectedValue(option.value)}
              className="hidden"
              name="preview-goods-filter"
            />
            <label
              htmlFor={option.id as string}
              className="block text-[10px] sm:text-base font-medium uppercase cursor-pointer py-2 px-3 sm:px-7.5 border-1 border-[#121212] border-solid rounded-full"
              style={
                selectedValue === option.value
                  ? {
                      color: "var(--text-secondary)",
                      backgroundColor: "var( --bg-dark)",
                    }
                  : {
                      color: "var(--text-primary)",
                      backgroundColor: "var( --bg-primary)",
                    }
              }
            >
              {option.label}
            </label>
          </div>
        ))}
    </div>
  );
};

export default OptionBtns;
