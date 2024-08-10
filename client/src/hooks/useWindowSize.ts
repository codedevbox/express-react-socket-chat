import { useState, useEffect } from "react";

type Size = [number, number];

function useWindowSize(): Size {
  const [size, setSize] = useState<Size>([0, 0]);

  useEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

export default useWindowSize;
