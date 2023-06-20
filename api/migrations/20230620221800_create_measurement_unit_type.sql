-- Add migration script here

CREATE TYPE measurement_unit AS ENUM (
  'milligrams', 
  'grams', 
  'kilograms', 
  'millilitres', 
  'litres', 
  'units'
);

