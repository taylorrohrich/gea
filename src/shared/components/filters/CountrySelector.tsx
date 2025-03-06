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
import { COUNTRY_CODES_MAP } from "@/shared/constants/countries";
import { CountryCode } from "@/shared/types/countries";

interface CountrySelectorProps {
  selectedCountries: CountryCode[]; // Array of country codes
  onSelectionChange: (selected: CountryCode[]) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountries,
  onSelectionChange,
}) => {
  const isAllSelected =
    selectedCountries.length === Object.keys(COUNTRY_CODES_MAP).length;

  // Handle selection change
  const handleChange = (event: SelectChangeEvent<CountryCode[]>) => {
    const value = event.target.value;

    // On autofill we get a string array
    const selected = typeof value === "string" ? value.split(",") : value;

    // Check if "All" is being toggled
    if (selected.includes("all")) {
      // If all countries were previously selected, clear the selection
      // Otherwise select all countries
      onSelectionChange(isAllSelected ? [] : Object.values(CountryCode));
    } else {
      onSelectionChange(selected as CountryCode[]);
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
                const countryName = COUNTRY_CODES_MAP[code];
                return (
                  <Chip
                    key={code}
                    label={countryName}
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
          {Object.entries(COUNTRY_CODES_MAP).map(([code, country]) => (
            <MenuItem key={code} value={country}>
              <Checkbox
                checked={selectedCountries.includes(code as CountryCode)}
              />
              <ListItemText primary={country} secondary={country} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
