import React from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  ListItemText,
  Select,
  SelectChangeEvent,
  Chip,
  OutlinedInput,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

// Define available countries
export const COUNTRIES = [
  { code: "USA", name: "United States" },
  { code: "JPN", name: "Japan" },
  { code: "CHN", name: "China" },
  { code: "IND", name: "India" },
  { code: "FRA", name: "France" },
  { code: "BRA", name: "Brazil" },
];

interface CountrySelectorProps {
  selectedCountries: string[]; // Array of country codes
  onSelectionChange: (selected: string[]) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountries,
  onSelectionChange,
}) => {
  const isAllSelected = selectedCountries.length === COUNTRIES.length;

  // Handle selection change
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;

    // On autofill we get a string array
    const selected = typeof value === "string" ? value.split(",") : value;

    // Check if "All" is being toggled
    if (selected.includes("all")) {
      // If all countries were previously selected, clear the selection
      // Otherwise select all countries
      onSelectionChange(
        isAllSelected ? [] : COUNTRIES.map((country) => country.code)
      );
    } else {
      onSelectionChange(selected);
    }
  };

  // Delete a selected country
  const handleDelete = (countryToDelete: string) => () => {
    onSelectionChange(
      selectedCountries.filter((code) => code !== countryToDelete)
    );
  };

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Countries
      </Typography>

      <FormControl fullWidth>
        <InputLabel id="countries-select-label">Selected Countries</InputLabel>
        <Select
          labelId="countries-select-label"
          id="countries-select"
          multiple
          value={selectedCountries}
          onChange={handleChange}
          input={<OutlinedInput label="Selected Countries" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((code) => {
                const country = COUNTRIES.find((c) => c.code === code);
                return (
                  <Chip
                    key={code}
                    label={country?.name || code}
                    onDelete={handleDelete(code)}
                    deleteIcon={
                      <CancelIcon
                        onMouseDown={(event) => event.stopPropagation()}
                      />
                    }
                  />
                );
              })}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 250,
                width: 250,
              },
            },
          }}
        >
          <MenuItem value="all">
            <Checkbox checked={isAllSelected} />
            <ListItemText primary="Select All" />
          </MenuItem>

          {COUNTRIES.map((country) => (
            <MenuItem key={country.code} value={country.code}>
              <Checkbox checked={selectedCountries.includes(country.code)} />
              <ListItemText primary={country.name} secondary={country.code} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
