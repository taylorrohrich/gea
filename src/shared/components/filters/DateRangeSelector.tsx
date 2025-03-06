import React, { ComponentProps } from "react";
import { Slider } from "@mui/material";

const MIN_YEAR = 1950;
const MAX_YEAR = 2024;

const MARKS: ComponentProps<typeof Slider>["marks"] = [];
for (let i = MAX_YEAR; i >= MIN_YEAR; i -= 10) {
  MARKS.push({ value: i, label: i.toString() });
}
MARKS.push({ value: MIN_YEAR, label: MIN_YEAR.toString() });

const STEP = 1;

interface Props {
  startYear: number;
  endYear: number;
  onRangeChange: (startYear: number, endYear: number) => void;
}

export function DateRangeSelector({
  startYear,
  endYear,
  onRangeChange,
}: Props) {
  // Handler for slider changes
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onRangeChange(newValue[0], newValue[1]);
    }
  };

  return (
    <div className="w-full py-4 px-2">
      <h3 className="text-base font-medium mb-2">Date Range</h3>
      <div className="text-center">
        <span className="text-sm bg-blue-50 text-blue-800 py-1 px-3 rounded-full">
          Selected: {startYear} - {endYear}
        </span>
      </div>
      <Slider
        value={[startYear, endYear]}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={STEP}
        marks={MARKS}
        sx={{
          "& .MuiSlider-thumb": {
            height: 20,
            width: 20,
            backgroundColor: "#fff",
            border: "2px solid currentColor",
            "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(63, 81, 181, 0.16)",
            },
          },
          "& .MuiSlider-track": {
            height: 4,
          },
          "& .MuiSlider-rail": {
            height: 4,
            opacity: 0.5,
            backgroundColor: "#bfbfbf",
          },
          mt: 2,
        }}
      />
    </div>
  );
}
