-- Add migration script here

CREATE TYPE measurement_unit AS ENUM (
  'mg', 
  'g', 
  'kg', 
  'mL', 
  'L', 
  'units'
);

