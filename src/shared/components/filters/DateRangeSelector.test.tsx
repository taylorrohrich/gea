import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateRangeSelector } from "./DateRangeSelector";
import "@testing-library/jest-dom";

// Mock MUI Slider
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  Slider: jest.fn(({ value, onChange }) => (
    <div data-testid="slider">
      <span>
        Current: {value[0]}-{value[1]}
      </span>
      <button
        data-testid="slider-change"
        onClick={() => onChange({} as Event, [value[0] + 5, value[1] - 5])}
      >
        Change Range
      </button>
    </div>
  )),
}));

describe("DateRangeSelector", () => {
  const mockOnRangeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with provided start and end years", () => {
    render(
      <DateRangeSelector
        startYear={1980}
        endYear={2010}
        onRangeChange={mockOnRangeChange}
      />
    );

    expect(screen.getByText("Date Range")).toBeInTheDocument();
    expect(screen.getByText("Selected: 1980 - 2010")).toBeInTheDocument();
    expect(screen.getByText("Current: 1980-2010")).toBeInTheDocument();
  });

  test("calls onRangeChange when slider value changes", () => {
    render(
      <DateRangeSelector
        startYear={1980}
        endYear={2010}
        onRangeChange={mockOnRangeChange}
      />
    );

    // Simulate slider change
    fireEvent.click(screen.getByTestId("slider-change"));

    // Check if callback was called with new values
    expect(mockOnRangeChange).toHaveBeenCalledWith(1985, 2005);
  });
});
