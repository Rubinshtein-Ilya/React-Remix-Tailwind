interface IProps {
  width?: number;
  height?: number;
  color?: string;
}

function ExportIcon(props: IProps) {
  const { width = 24, height = 24, color = "black" } = props;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs />
      <path
        d="M16.44 8.9C20.04 9.21 21.5 11.06 21.5 15.11L21.5 15.24C21.5 19.71 19.72 21.5 15.25 21.5L8.74 21.5C4.26 21.5 2.48 19.71 2.48 15.24L2.48 15.11C2.48 11.08 3.92 9.24 7.47 8.91"
        stroke={color}
        strokeOpacity="1.000000"
        strokeWidth="2.000000"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M12 15L12 3.61"
        stroke={color}
        strokeOpacity="1.000000"
        strokeWidth="2.000000"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M15.34 5.84L11.99 2.5L8.64 5.84"
        stroke={color}
        strokeOpacity="1.000000"
        strokeWidth="2.000000"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <g opacity="0.000000">
        <path
          d="M24 24L0 24L0 0L24 0L24 24ZM22 2L22 22L2 22L2 2L22 2Z"
          fill={color}
          fillOpacity="1.000000"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
}

export default ExportIcon;
