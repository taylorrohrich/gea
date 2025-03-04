import React from "react";
import { Slider, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledSlider = styled(Slider)({
  "& .MuiSlider-thumb": {
    height: 24,
    width: 24,
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
});

const MIN_YEAR = 1950;
const MAX_YEAR = 2024;
const STEP = 1;

interface DateRangeSelectorProps {
  startYear: number;
  endYear: number;
  onRangeChange: (startYear: number, endYear: number) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startYear,
  endYear,
  onRangeChange,
}) => {
  // Handler for slider changes
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onRangeChange(newValue[0], newValue[1]);
    }
  };

  // Handler for direct text input changes
  const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= MIN_YEAR && value <= endYear) {
      onRangeChange(value, endYear);
    }
  };

  const handleEndYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value <= MAX_YEAR && value >= startYear) {
      onRangeChange(startYear, value);
    }
  };

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Date Range
      </Typography>

      <StyledSlider
        value={[startYear, endYear]}
        onChange={handleSliderChange}
        valueLabelDisplay="auto"
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={STEP}
        marks={[
          { value: MIN_YEAR, label: MIN_YEAR.toString() },
          { value: 1990, label: "1990" },
          { value: 2000, label: "2000" },
          { value: 2010, label: "2010" },
          { value: MAX_YEAR, label: MAX_YEAR.toString() },
        ]}
        sx={{ mt: 4, mb: 1 }}
      />
    </Box>
  );
};
