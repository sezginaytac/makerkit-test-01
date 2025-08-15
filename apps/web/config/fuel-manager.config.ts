export const fuelManagerConfig = {
  // Default R.O.B. (Remaining Onboard) values for different fuel types
  defaultRobValues: {
    hfo: 100,
    vlsfo: 120,
    ulsfo: 80,
    mgo: 50, // Adding MGO as well
    lng: 60, // Adding LNG as well
  },
  
  // Fuel type mappings for display
  fuelTypeLabels: {
    hfo: 'HFO',
    vlsfo: 'VLSFO', 
    ulsfo: 'ULSFO',
    mgo: 'MGO',
    lng: 'LNG',
  },
  
  // Units
  units: {
    volume: 'tons',
    consumption: 'tons/day',
  },
} as const;

export type FuelType = keyof typeof fuelManagerConfig.defaultRobValues;
