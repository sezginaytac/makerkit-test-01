import { createClient } from '@supabase/supabase-js';
import { FuelQualityData, FuelType } from '../types';

export class FuelQualityService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Upload a fuel quality data file to Supabase Storage and create database record
   */
  async uploadFile(
    file: File, 
    fuelType: FuelType, 
    accountId: string,
    qualityMetrics: Record<string, number>
  ): Promise<FuelQualityData> {
    // Generate unique storage key
    const storageKey = `fuel-quality/${accountId}/${Date.now()}-${file.name}`;
    
    // Upload file to storage
    const { error: uploadError } = await this.supabase.storage
      .from('fuel-manager-files')
      .upload(storageKey, file);

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Create database record
    const { data, error } = await this.supabase
      .from('fuel_quality_data')
      .insert({
        file_name: file.name,
        storage_key: storageKey,
        file_size: file.size,
        content_type: file.type,
        fuel_type: fuelType,
        quality_metrics: qualityMetrics,
        account_id: accountId
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded file if database insert fails
      await this.supabase.storage
        .from('fuel-manager-files')
        .remove([storageKey]);
      throw new Error(`Database insert failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all fuel quality data for an account
   */
  async getAllData(accountId: string): Promise<FuelQualityData[]> {
    const { data, error } = await this.supabase
      .from('fuel_quality_data')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get fuel quality data by ID
   */
  async getById(id: string, accountId: string): Promise<FuelQualityData | null> {
    const { data, error } = await this.supabase
      .from('fuel_quality_data')
      .select('*')
      .eq('id', id)
      .eq('account_id', accountId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    return data;
  }

  /**
   * Update fuel quality data
   */
  async updateData(
    id: string, 
    updateData: Partial<FuelQualityData>, 
    accountId: string
  ): Promise<FuelQualityData> {
    const { data, error } = await this.supabase
      .from('fuel_quality_data')
      .update(updateData)
      .eq('id', id)
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update data: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete fuel quality data and associated file
   */
  async deleteData(id: string, accountId: string): Promise<void> {
    // Get the record first to get the storage key
    const record = await this.getById(id, accountId);
    if (!record) {
      throw new Error('Record not found');
    }

    // Delete from database
    const { error: deleteError } = await this.supabase
      .from('fuel_quality_data')
      .delete()
      .eq('id', id)
      .eq('account_id', accountId);

    if (deleteError) {
      throw new Error(`Failed to delete record: ${deleteError.message}`);
    }

    // Delete from storage
    if (record.storage_key) {
      const { error: storageError } = await this.supabase.storage
        .from('fuel-manager-files')
        .remove([record.storage_key]);

      if (storageError) {
        console.warn(`Failed to delete file from storage: ${storageError.message}`);
        // Don't throw error here as the database record is already deleted
      }
    }
  }

  /**
   * Get file download URL
   */
  async getDownloadUrl(storageKey: string): Promise<string> {
    const { data } = await this.supabase.storage
      .from('fuel-manager-files')
      .createSignedUrl(storageKey, 3600); // 1 hour expiry

    if (!data?.signedUrl) {
      throw new Error('Failed to generate download URL');
    }

    return data.signedUrl;
  }

  /**
   * Get fuel quality data by fuel type
   */
  async getByFuelType(fuelType: FuelType, accountId: string): Promise<FuelQualityData[]> {
    const { data, error } = await this.supabase
      .from('fuel_quality_data')
      .select('*')
      .eq('fuel_type', fuelType)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    return data || [];
  }
}
