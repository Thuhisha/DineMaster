import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './CustomDatePicker.css';

export default function CustomDatePicker({ id, selected, onChange, placeholderText, minDate, maxDate, className, ...props }) {
  const handleKeyDown = (e) => {
    e.preventDefault(); // Completely prevent typing in the input field to force exactly 4-digit year format
  };

  return (
    <DatePicker
      id={id}
      selected={selected}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      dateFormat="dd-MM-yyyy"
      placeholderText={placeholderText || "Select a date"}
      className={"custom-datepicker-input " + (className || "")}
      onKeyDown={handleKeyDown}
      onChangeRaw={(e) => e.preventDefault()}
      showYearDropdown
      showMonthDropdown
      dropdownMode="select"
      yearDropdownItemNumber={props.yearDropdownItemNumber || 2}
      scrollableYearDropdown
      showIcon
      toggleCalendarOnIconClick
      {...props}
    />
  );
}
