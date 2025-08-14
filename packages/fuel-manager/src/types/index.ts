// Manual type definitions for Fuel Manager tables
// These types match the database schema defined in the migration

// Database table types
export type FuelQualityData = {
  id: string;
  file_name: string;
  storage_key: string;
  file_size: number;
  content_type: string;
  fuel_type: FuelType;
  quality_metrics: Record<string, number>;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type Port = {
  id: string;
  name: string;
  country: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type PortFuelQualityIndex = {
  id: string;
  port_id: string;
  fuel_type: FuelType;
  quality_score: number;
  metrics: Record<string, number>;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type PortFuelQualityValue = {
  id: string;
  port_fuel_quality_index_id: string;
  metric_name: string;
  metric_value: number;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type Ship = {
  id: string;
  name: string;
  imo_number?: string;
  vessel_type?: string;
  capacity?: number;
  fuel_consumption_rate?: number;
  fuel_types: string; // Comma-separated fuel types (HFO,VLSFO,ULSFO)
  is_active?: boolean;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type FuelInventory = {
  id: string;
  ship_id: string;
  port_id: string;
  fuel_type: FuelType;
  quantity: number;
  price: number;
  date: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type SupplyAndDemandData = {
  id: string;
  fuel_type: FuelType;
  supply_volume: number;
  demand_volume: number;
  price: number;
  date: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type ProcurementDecision = {
  id: string;
  decision_type: string;
  fuel_type: FuelType;
  quantity: number;
  price: number;
  supplier: string;
  notes: string | null;
  decision_date: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type PricePredictionFile = {
  id: string;
  file_name: string;
  storage_key: string;
  file_size: number;
  content_type: string;
  predictions: string | null;
  is_active: boolean;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type Forecast = {
  id: string;
  fuel_type: FuelType;
  forecast_date: string;
  predicted_price: number;
  confidence_level: number;
  factors_considered: string[];
  methodology: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

export type CalculatedShipPriceCoefficient = {
  id: string;
  ship_id: string;
  fuel_type: FuelType;
  coefficient: number;
  calculation_date: string;
  account_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

// Fuel type enum
export type FuelType = 'diesel' | 'gasoline' | 'heavy_fuel_oil' | 'marine_gas_oil' | 'liquefied_natural_gas';

// DTO types for API responses
export interface PricePredictionResponse {
  id: string;
  fileName: string;
  predictions: string;
  isActive: boolean;
}

export interface PricePredictionPythonResponse {
  predictions: number[];
}

export interface StringResponse {
  message: string;
}

// Service interfaces
export interface FuelManagerService {
  // Price Prediction
  uploadFile(file: File, accountId: string): Promise<void>;
  getAllPredictions(accountId: string): Promise<PricePredictionResponse[]>;
  processFile(id: string, accountId: string): Promise<void>;
  setFileActive(id: string, accountId: string): Promise<void>;
  deleteFile(id: string, accountId: string): Promise<void>;
  getFirstActivePredictionList(accountId: string): Promise<number[]>;

  // Fuel Quality Data
  createFuelQualityData(data: Omit<FuelQualityData, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<FuelQualityData>;
  getFuelQualityData(accountId: string): Promise<FuelQualityData[]>;
  updateFuelQualityData(id: string, data: Partial<FuelQualityData>, accountId: string): Promise<FuelQualityData>;
  deleteFuelQualityData(id: string, accountId: string): Promise<void>;

  // Ports
  createPort(data: Omit<Port, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<Port>;
  getPorts(accountId: string): Promise<Port[]>;
  updatePort(id: string, data: Partial<Port>, accountId: string): Promise<Port>;
  deletePort(id: string, accountId: string): Promise<void>;

  // Ships
  createShip(data: Omit<Ship, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<Ship>;
  getShips(accountId: string): Promise<Ship[]>;
  updateShip(id: string, data: Partial<Ship>, accountId: string): Promise<Ship>;
  deleteShip(id: string, accountId: string): Promise<void>;

  // Customers
  createCustomer(data: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<Customer>;
  getCustomers(accountId: string): Promise<Customer[]>;
  updateCustomer(id: string, data: Partial<Customer>, accountId: string): Promise<Customer>;
  deleteCustomer(id: string, accountId: string): Promise<void>;

  // Fuel Inventory
  createFuelInventory(data: Omit<FuelInventory, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<FuelInventory>;
  getFuelInventory(accountId: string): Promise<FuelInventory[]>;
  updateFuelInventory(id: string, data: Partial<FuelInventory>, accountId: string): Promise<FuelInventory>;
  deleteFuelInventory(id: string, accountId: string): Promise<void>;

  // Supply and Demand Data
  createSupplyAndDemandData(data: Omit<SupplyAndDemandData, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<SupplyAndDemandData>;
  getSupplyAndDemandData(accountId: string): Promise<SupplyAndDemandData[]>;
  updateSupplyAndDemandData(id: string, data: Partial<SupplyAndDemandData>, accountId: string): Promise<SupplyAndDemandData>;
  deleteSupplyAndDemandData(id: string, accountId: string): Promise<void>;

  // Procurement Decisions
  createProcurementDecision(data: Omit<ProcurementDecision, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<ProcurementDecision>;
  getProcurementDecisions(accountId: string): Promise<ProcurementDecision[]>;
  updateProcurementDecision(id: string, data: Partial<ProcurementDecision>, accountId: string): Promise<ProcurementDecision>;
  deleteProcurementDecision(id: string, accountId: string): Promise<void>;
  approveProcurementDecision(id: string, accountId: string): Promise<ProcurementDecision>;
}

// File upload types
export interface FileUploadData {
  file: File;
  fileName: string;
  fileSize: number;
  contentType: string;
  accountId: string;
}

// Processing status types
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Error types
export interface FuelManagerError {
  code: string;
  message: string;
  details?: any;
}

// Configuration types
export interface FuelManagerConfig {
  pythonApiUrl: string;
  storageBucket: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}
