interface IProps {
  price: number | string;
  styles?: string;
  onClick?: () => void;
}

function BetPriceButton({ price, styles, onClick }: IProps) {
  return (
    <button
      className={`w-34 h-10 border  rounded-full  grid place-content-center font-extrabold ${styles}`}
      onClick={onClick}
    >
      {" "}
      {price} ₽
    </button>
  );
}

export default BetPriceButton;
