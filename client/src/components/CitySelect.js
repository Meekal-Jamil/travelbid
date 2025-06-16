import React from 'react';
import { Form } from 'react-bootstrap';

const cities = [
   { country: 'Pakistan', cities: [
    'Islamabad', 'Lahore', 'Karachi', 'Multan', 'Peshawar',
    'Swat', 'Faisalabad', 'Sialkot', 'Quetta', 'Skardu'
  ]},
  { country: 'United States', cities: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'
  ]},
  { country: 'United Kingdom', cities: [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow',
    'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh'
  ]},
  { country: 'Canada', cities: [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton',
    'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'
  ]},
  { country: 'Australia', cities: [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
    'Gold Coast', 'Newcastle', 'Canberra', 'Wollongong', 'Hobart'
  ]},
  { country: 'India', cities: [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ]},
  { country: 'Japan', cities: [
    'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo',
    'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'
  ]}
];

const CitySelect = ({ value, onChange, label = 'Select City', required = false }) => {
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Select
        value={value}
        onChange={onChange}
        required={required}
        className="form-select"
      >
        <option value="">Select a city</option>
        {cities.map((countryGroup) => (
          <optgroup key={countryGroup.country} label={countryGroup.country}>
            {countryGroup.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </optgroup>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default CitySelect; 