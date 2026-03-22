"use client";

import type { Format } from "@number-flow/react";
import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

type AnimatedMetricNumberProps = {
  value: number;
  format?: Format;
};

function AnimatedMetricNumber({ value, format }: AnimatedMetricNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return <NumberFlow value={displayValue} format={format} />;
}

export type { AnimatedMetricNumberProps };
export { AnimatedMetricNumber };
