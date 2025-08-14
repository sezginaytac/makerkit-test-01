import { FuelType } from '../types';

/**
 * Validate file type and size
 */
export function validateFile(file: File, maxSizeMB: number = 10): {
  isValid: boolean;
  error?: string;
} {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  // Check file type (Excel files)
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only Excel (.xlsx, .xls) and CSV files are allowed'
    };
  }

  return { isValid: true };
}

/**
 * Generate storage key for fuel quality files
 */
export function generateStorageKey(
  fileName: string, 
  accountId: string, 
  fuelType: FuelType
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `fuel-quality/${accountId}/${fuelType}/${timestamp}-${sanitizedFileName}`;
}

/**
 * Parse Excel file and extract quality metrics
 * This is a placeholder - actual implementation would use a library like xlsx
 */
export async function parseExcelFile(file: File): Promise<Record<string, number>> {
  // TODO: Implement actual Excel parsing using xlsx library
  // For now, return mock data
  return {
    density: 0.85,
    viscosity: 2.5,
    sulfurContent: 0.1,
    flashPoint: 60,
    pourPoint: -10,
    cloudPoint: -5,
    cetaneNumber: 50,
    octaneNumber: 95,
    waterContent: 0.05,
    ashContent: 0.01,
    carbonResidue: 0.1
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a document
 */
export function isDocumentFile(file: File): boolean {
  return file.type.includes('document') || 
         file.type.includes('spreadsheet') || 
         file.type.includes('presentation') ||
         file.type === 'text/csv';
}
