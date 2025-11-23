interface Props {
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}
function HeartIcon(props: Props) {
  const { width = 31.884766, height = 31.884766, color = "black", filled = false } = props;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 31.8848 31.8848"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs />
      <rect
        id="vuesax/linear/heart"
        rx="0.000000"
        width="30.557142"
        height="30.557142"
        transform="translate(0.664286 0.664286)"
        fill="#fff"
        fillOpacity="0"
      />
      <path
        id="Vector"
        d="M15.11 27.64C11.26 26.33 2.65 20.84 2.65 11.54C2.65 7.43 5.96 4.11 10.04 4.11C12.46 4.11 14.59 5.28 15.94 7.09C17.28 5.28 19.43 4.11 21.84 4.11C25.91 4.11 29.22 7.43 29.22 11.54C29.22 20.84 20.61 26.33 16.76 27.64C16.31 27.8 15.57 27.8 15.11 27.64Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeOpacity="1.000000"
        strokeWidth="2.500000"
        strokeLinejoin="round"
      />
      <g opacity="0.000000" />
    </svg>
  );
}

export default HeartIcon;
