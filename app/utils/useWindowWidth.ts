import { useEffect, useState } from "react";

function useWindowWidth() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateWidth = () => setWidth(window.innerWidth);

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return width;
}

export default useWindowWidth;
