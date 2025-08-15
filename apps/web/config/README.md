# Configuration Files

## Fuel Manager Configuration

The fuel manager configuration is located in `fuel-manager.config.ts` and contains settings for:

### Default R.O.B. Values

R.O.B. (Remaining Onboard) values are automatically set when a ship is selected. These values can be configured in the `defaultRobValues` object:

```typescript
defaultRobValues: {
  hfo: 100,    // Heavy Fuel Oil - 100 tons
  vlsfo: 120,  // Very Low Sulphur Fuel Oil - 120 tons
  ulsfo: 80,   // Ultra Low Sulphur Fuel Oil - 80 tons
  mgo: 50,     // Marine Gas Oil - 50 tons
  lng: 60,     // Liquefied Natural Gas - 60 tons
}
```

### Adding New Fuel Types

To add a new fuel type:

1. Add the fuel type to `defaultRobValues` in `fuel-manager.config.ts`
2. Add the display label to `fuelTypeLabels`
3. Add translation keys to both `en/common.json` and `tr/common.json` under `fuelTypesOptions`

### Fuel Type Labels

Display labels for fuel types can be customized in the `fuelTypeLabels` object:

```typescript
fuelTypeLabels: {
  hfo: 'HFO',
  vlsfo: 'VLSFO', 
  ulsfo: 'ULSFO',
  mgo: 'MGO',
  lng: 'LNG',
}
```

### Units

Units for volume and consumption can be configured in the `units` object:

```typescript
units: {
  volume: 'tons',
  consumption: 'tons/day',
}
```

## Usage

The configuration is automatically used by the fuel inventory component. When a ship is selected:

1. The system checks if existing fuel inventory data exists
2. If no existing data, it uses the default R.O.B. values from configuration
3. If existing data exists, it preserves the saved R.O.B. values
4. R.O.B. values are displayed as read-only fields
