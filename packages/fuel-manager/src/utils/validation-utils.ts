import { FuelType } from '../types';

/**
 * Validate fuel type
 */
export function validateFuelType(fuelType: string): fuelType is FuelType {
  const validTypes: FuelType[] = [
    'diesel',
    'gasoline', 
    'heavy_fuel_oil',
    'marine_gas_oil',
    'liquefied_natural_gas'
  ];
  return validTypes.includes(fuelType as FuelType);
}

/**
 * Validate quantity (must be positive number)
 */
export function validateQuantity(quantity: number): boolean {
  return typeof quantity === 'number' && quantity > 0 && isFinite(quantity);
}

/**
 * Validate price (must be positive number)
 */
export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price > 0 && isFinite(price);
}

/**
 * Validate ship name (must be non-empty string)
 */
export function validateShipName(shipName: string): boolean {
  return typeof shipName === 'string' && shipName.trim().length > 0;
}

/**
 * Validate port name (must be non-empty string)
 */
export function validatePortName(portName: string): boolean {
  return typeof portName === 'string' && portName.trim().length > 0;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date format (ISO string)
 */
export function validateDate(date: string): boolean {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Validate JSON string
 */
export function validateJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate numeric range
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate string length
 */
export function validateStringLength(str: string, minLength: number, maxLength: number): boolean {
  return str.length >= minLength && str.length <= maxLength;
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Validate fuel quality metrics
 */
export function validateFuelQualityMetrics(metrics: Record<string, number>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check if metrics object exists
  if (!metrics || typeof metrics !== 'object') {
    errors.push('Metrics must be a valid object');
    return { isValid: false, errors };
  }

  // Check each metric value
  Object.entries(metrics).forEach(([key, value]) => {
    if (typeof value !== 'number' || !isFinite(value)) {
      errors.push(`Metric ${key} must be a valid number`);
    }
    
    // Check for negative values where they shouldn't be
    if (['density', 'viscosity', 'flashPoint', 'pourPoint', 'cloudPoint', 'cetaneNumber', 'octaneNumber'].includes(key)) {
      if (value < 0) {
        errors.push(`Metric ${key} cannot be negative`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
