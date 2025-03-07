import React from "react";
import {
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

interface Props {
  selectedCountries: CountryCode[];
  onSelectionChange: (selected: CountryCode[]) => void;
}

export function CountrySelector({
  selectedCountries,
  onSelectionChange,
}: Props) {
  const isAllSelected =
    selectedCountries.length === Object.keys(COUNTRY_CODES_MAP).length;

  // Handle selection change
  const handleChange = (event: SelectChangeEvent<(CountryCode | "all")[]>) => {
    const value = event.target.value;

    // Check if "All" is being toggled
    if (value.includes("all")) {
      // If all countries were previously selected, clear the selection
      // Otherwise select all countries
      onSelectionChange(isAllSelected ? [] : Object.values(CountryCode));
    } else {
      onSelectionChange(value as CountryCode[]);
    }
  };

  // Delete a selected country
  const handleDelete = (countryToDelete: string) => () => {
    onSelectionChange(
      selectedCountries.filter((code) => code !== countryToDelete)
    );
  };

  return (
    <div className="w-full p-2">
      <h3 className="text-base font-medium mb-2">Countries</h3>
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
            <div className="flex flex-wrap gap-1">
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
            </div>
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
            <MenuItem key={code} value={code}>
              <Checkbox
                checked={selectedCountries.includes(code as CountryCode)}
              />
              <ListItemText primary={country} secondary={country} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
