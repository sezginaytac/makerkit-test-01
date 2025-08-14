import { createClient } from '@supabase/supabase-js';
import { FuelInventory, Ship, Port, FuelType } from '../types';

export class FuelInventoryService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Calculate and save fuel inventory data
   */
  async calculateAndSave(
    inventoryData: {
      shipName: string;
      imoNumber?: string;
      portName: string;
      fuelType: FuelType;
      quantity: number;
      price: number;
    },
    accountId: string
  ): Promise<FuelInventory> {
    // Get existing ship (don't create if not exists)
    const ship = await this.getShipByName(inventoryData.shipName, accountId);
    if (!ship) {
      throw new Error(`Ship not found for name: ${inventoryData.shipName}`);
    }
    
    // Get or create port
    const port = await this.getOrCreatePort(inventoryData.portName, accountId);

    // Create fuel inventory record
    const { data, error } = await this.supabase
      .from('fuel_inventory')
      .insert({
        ship_id: ship.id,
        port_id: port.id,
        fuel_type: inventoryData.fuelType,
        quantity: inventoryData.quantity,
        price: inventoryData.price,
        account_id: accountId
      })
      .select(`
        *,
        ships(name),
        ports(name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create fuel inventory: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all fuel inventory data for an account
   */
  async getAllData(accountId: string): Promise<FuelInventory[]> {
    const { data, error } = await this.supabase
      .from('fuel_inventory')
      .select(`
        *,
        ships(name),
        ports(name)
      `)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch fuel inventory data: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all ship names for an account
   */
  async getShipNames(accountId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('ships')
      .select('name')
      .eq('account_id', accountId)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch ship names: ${error.message}`);
    }

    return data?.map(ship => ship.name) || [];
  }

  /**
   * Get all port names for an account
   */
  async getPortNames(accountId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('ports')
      .select('name')
      .eq('account_id', accountId)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch port names: ${error.message}`);
    }

    return data?.map(port => port.name) || [];
  }

  /**
   * Get all fuel types available in inventory
   */
  async getFuelTypes(accountId: string): Promise<FuelType[]> {
    const { data, error } = await this.supabase
      .from('fuel_inventory')
      .select('fuel_type')
      .eq('account_id', accountId);

    if (error) {
      throw new Error(`Failed to fetch fuel types: ${error.message}`);
    }

    // Get unique fuel types
    const uniqueTypes = [...new Set(data?.map(item => item.fuel_type))];
    return uniqueTypes as FuelType[];
  }

  /**
   * Add a new ship
   */
  async addShip(
    shipName: string, 
    imoNumber?: string, 
    accountId: string,
    vesselType?: string,
    capacity?: number,
    fuelConsumptionRate?: number
  ): Promise<Ship> {
    // Check if ship already exists
    const existingShip = await this.getShipByName(shipName, accountId);
    if (existingShip) {
      throw new Error('Ship already exists');
    }

    // Create new ship
    const shipData: any = { 
      name: shipName,
      account_id: accountId,
      created_by: accountId,
      updated_by: accountId
    };

    // Add IMO number if provided
    if (imoNumber) {
      shipData.imo_number = imoNumber;
    } else {
      // Generate a default IMO number if not provided
      shipData.imo_number = `IMO${Date.now()}`;
    }

    // Add optional fields
    if (vesselType) {
      shipData.vessel_type = vesselType;
    }
    if (capacity) {
      shipData.capacity = capacity;
    }
    if (fuelConsumptionRate) {
      shipData.fuel_consumption_rate = fuelConsumptionRate;
    }

    const { data, error } = await this.supabase
      .from('ships')
      .insert(shipData)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create ship: ${error.message}`);
    }

    return data;
  }

  /**
   * Get ship data by name
   */
  async getShipData(shipName: string, accountId: string): Promise<{
    ship: Ship;
    inventory: FuelInventory[];
  }> {
    // Get ship
    const ship = await this.getShipByName(shipName, accountId);
    if (!ship) {
      throw new Error('Ship not found');
    }

    // Get fuel inventory data for this ship
    const { data: inventory, error } = await this.supabase
      .from('fuel_inventory')
      .select(`
        *,
        ports(name)
      `)
      .eq('ship_id', ship.id)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch ship inventory: ${error.message}`);
    }

    return {
      ship,
      inventory: inventory || []
    };
  }

  /**
   * Delete fuel inventory by ID
   */
  async deleteInventory(id: string, accountId: string): Promise<void> {
    const { error } = await this.supabase
      .from('fuel_inventory')
      .delete()
      .eq('id', id)
      .eq('account_id', accountId);

    if (error) {
      throw new Error(`Failed to delete fuel inventory: ${error.message}`);
    }
  }

  /**
   * Get inventory statistics for an account
   */
  async getInventoryStats(accountId: string): Promise<{
    totalShips: number;
    totalPorts: number;
    totalInventory: number;
    totalValue: number;
  }> {
    // Get counts
    const [shipsCount, portsCount, inventoryCount] = await Promise.all([
      this.supabase.from('ships').select('id', { count: 'exact', head: true }).eq('account_id', accountId),
      this.supabase.from('ports').select('id', { count: 'exact', head: true }).eq('account_id', accountId),
      this.supabase.from('fuel_inventory').select('id', { count: 'exact', head: true }).eq('account_id', accountId)
    ]);

    // Calculate total value
    const { data: inventoryData } = await this.supabase
      .from('fuel_inventory')
      .select('quantity, price')
      .eq('account_id', accountId);

    const totalValue = inventoryData?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;

    return {
      totalShips: shipsCount.count || 0,
      totalPorts: portsCount.count || 0,
      totalInventory: inventoryCount.count || 0,
      totalValue
    };
  }



  /**
   * Get or create port (private helper)
   */
  private async getOrCreatePort(portName: string, accountId: string): Promise<Port> {
    let port = await this.getPortByName(portName, accountId);

    if (!port) {
      port = await this.addPort(portName, accountId);
    }

    return port;
  }

  /**
   * Get ship by name
   */
  async getShipByName(shipName: string, accountId: string): Promise<Ship | null> {
    const { data, error } = await this.supabase
      .from('ships')
      .select('*')
      .eq('name', shipName)
      .eq('account_id', accountId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch ship: ${error.message}`);
    }

    return data as Ship;
  }

  /**
   * Get port by name (private helper)
   */
  private async getPortByName(portName: string, accountId: string): Promise<Port | null> {
    const { data, error } = await this.supabase
      .from('ports')
      .select('*')
      .eq('name', portName)
      .eq('account_id', accountId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch port: ${error.message}`);
    }

    return data as Port;
  }

  /**
   * Add a new port (private helper)
   */
  private async addPort(portName: string, accountId: string): Promise<Port> {
    const { data, error } = await this.supabase
      .from('ports')
      .insert({ 
        name: portName,
        account_id: accountId,
        created_by: accountId,
        updated_by: accountId
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create port: ${error.message}`);
    }

    return data as Port;
  }
}
