import { useEffect, useState } from "react";
import clsx from "clsx";
import { Form, useFetcher } from "react-router";
import { RiCloseLine } from "@remixicon/react";
import FilterItemHeading from "./FilterItemHeading";
import CustomCheckbox from "./CustomCheckbox";
import { useForm } from "react-hook-form";

const players = [
  { id: "akinfeev", name: "Игорь Акинфеев" },
  { id: "ignashevich", name: "Сергей Игнашевич" },
  { id: "semak", name: "Сергей Семак" },
];

const conditions = [
  { id: "worn", name: "Worn" },
  { id: "autographed", name: "C автографом" },
  { id: "played", name: "Заигранная" },
];

const statuses = [
  { id: "all", name: "Все" },
  { id: "auction", name: "Аукционные товары" },
  { id: "fixed", name: "Товары с фиксированной ценой" },
];

interface IFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface IForm {
  players: string[];
  condition: string[];
  status: string[];
  minPrice: number | null;
  maxPrice: number | null;
}

function ProductFilter() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="fixed top-0 left-0 z-40 w-full h-full bg-black/50" />}
      <div
        className="text-xs sm:text-base lg:text-xl text-[var(--text-secondary)] bg-[var(--bg-dark)] font-medium leading-6 uppercase py-1 sm:py-2 px-6 rounded-full cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        ФИЛЬТРЫ
      </div>

      {isOpen && <ProductFilterForm isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
}

export default ProductFilter;

// FILTER FORM

function ProductFilterForm({ isOpen, setIsOpen }: IFormProps) {
  const fetcher = useFetcher();
  const { register, handleSubmit, watch } = useForm<IForm>({
    defaultValues: {
      players: [],
      condition: [],
      status: [],
      minPrice: null,
      maxPrice: null,
    },
  });

  const selectedPlayers = watch("players") || [];
  const selectedCondition = watch("condition") || [];
  const selectedStatus = watch("status") || [];

  const onSubmit = (data: any) => {
    console.log("Form data:", data);
    setIsOpen(false);
    // fetcher.submit(data)
  };

  return (
    <div
      className={clsx(
        "fixed top-0 right-0 z-50 w-full sm:w-96 h-full shadow-2xl shadow-black/5 transition-transform duration-1000 will-change-transform transform py-12 px-9 overflow-y-auto",
        {
          "translate-x-0 opacity-100 ease-out": isOpen,
          "translate-x-full opacity-0 ease-in": !isOpen,
        }
      )}
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      <div className="flex w-full items-center justify-between pb-9">
        <div
          className="text-3xl font-medium leading-6 uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          ФИЛЬТРЫ
        </div>
        <RiCloseLine
          size={28}
          color="var(--text-secondary)"
          onClick={() => setIsOpen(false)}
          className="cursor-pointer"
        />
      </div>
      <Form className="flex flex-col gap-y-9" onSubmit={handleSubmit(onSubmit)}>
        {/* price */}
        <div className="flex flex-col gap-y-2.5">
          <FilterItemHeading title="ЦЕНА" />
          <div className="flex gap-x-1">
            <div className="w-1/2 flex flex-col gap-y-1">
              <label
                htmlFor="minPrice"
                className="text-base text-[var(--text-secondary)] font-medium "
              >
                От
              </label>
              <input
                type="number"
                id="minPrice"
                className="w-full rounded-lg border border-[var(--border-neutral)] py-1 px-3 text-base font-medium placeholder:text-[var(--text-muted)]"
                placeholder="1 000 ₽"
                {...register("minPrice")}
              />
            </div>
            <div className="w-1/2 flex flex-col gap-y-1">
              <label
                htmlFor="maxPrice"
                className="text-base text-[var(--text-secondary)] font-medium"
              >
                До
              </label>
              <input
                type="number"
                id="maxPrice"
                className="w-full rounded-lg border border-[var(--border-neutral)] py-1 px-3 text-base font-medium placeholder:text-[var(--text-muted)]"
                placeholder="20 000 ₽"
                {...register("maxPrice")}
              />
            </div>
          </div>
        </div>

        {/* player */}
        <div className="flex flex-col gap-y-2.5">
          <FilterItemHeading title="СПОРТСМЕН" />
          <div className="flex flex-col gap-y-2.5 items-start">
            {players.map((player) => (
              <CustomCheckbox
                key={player.id}
                id={player.id}
                label={player.name}
                register={register("players")}
                selectedValues={selectedPlayers}
              />
            ))}
          </div>
        </div>

        {/* condition */}
        <div className="flex flex-col gap-y-2.5">
          <FilterItemHeading title="СОСТОЯНИЕ" />
          <div className="flex flex-col gap-y-2.5 items-start">
            {conditions.map((condition) => (
              <CustomCheckbox
                key={condition.id}
                id={condition.id}
                label={condition.name}
                register={register("condition")}
                selectedValues={selectedCondition}
              />
            ))}
          </div>
        </div>

        {/* status */}
        <div className="flex flex-col gap-y-2.5">
          <FilterItemHeading title="СТАТУС" />
          <div className="flex flex-col gap-y-2.5 items-start">
            {statuses.map((status) => (
              <CustomCheckbox
                key={status.id}
                id={status.id}
                label={status.name}
                register={register("status")}
                selectedValues={selectedStatus}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-2 text-base font-medium text-white"
        >
          ПОКАЗАТЬ
        </button>
      </Form>
    </div>
  );
}
