'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Download, Eye, Trash2, Save, Edit, Upload, Plus, ArrowUpDown } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@kit/ui/alert-dialog';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';
import { If } from '@kit/ui/if';
import { EmptyState } from '@kit/ui/empty-state';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { UploadExcelDialog } from './upload-excel-dialog';
import { ViewDataDialog } from './view-data-dialog';

interface FuelQualityData {
  id: string;
  port: string;
  supplier?: string;
  date?: string;
  fuel_type?: string;
  grade?: string;
  density_15c?: number;
  k_viscosity_50c?: number;
  flash_point?: number;
  pour_point?: number;
  mcr?: number;
  ash?: number;
  water_content?: number;
  sulphur_content?: number;
  total_sediment?: number;
  vanadium?: number;
  sodium?: number;
  aluminium?: number;
  silicon?: number;
  aluminium_silicon?: number;
  calcium?: number;
  phosphorus?: number;
  zinc?: number;
  iron?: number;
  nickel?: number;
  lead?: number;
  potassium?: number;
  ccai?: number;
  net_specific_energy?: number;
  gross_specific_energy?: number;
}

interface FuelQualityDataPageContentProps {
  accountId: string;
}

export function FuelQualityDataPageContent({ accountId }: FuelQualityDataPageContentProps) {
  const { t } = useTranslation();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<FuelQualityData>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FuelQualityData;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Fetch fuel quality data
  const { data: fuelQualityData, isLoading } = useQuery({
    queryKey: ['fuel-quality-data', accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fuel_quality_data')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FuelQualityData[];
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<FuelQualityData> }) => {
      const { error } = await supabase
        .from('fuel_quality_data')
        .update(data.updates)
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-quality-data', accountId] });
      toast.success(t('common:fuelQualityData.updateSuccess'));
      setEditingRow(null);
      setEditingData({});
    },
    onError: () => {
      toast.error(t('common:fuelQualityData.updateError'));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fuel_quality_data')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-quality-data', accountId] });
      toast.success(t('common:fuelQualityData.deleteSuccess'));
    },
    onError: () => {
      toast.error(t('common:fuelQualityData.deleteError'));
    },
  });

  // Download data
  const downloadData = (data: FuelQualityData) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-quality-data-${data.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle edit
  const handleEdit = (row: FuelQualityData) => {
    setEditingRow(row.id);
    setEditingData(row);
  };

  // Handle save
  const handleSave = (id: string) => {
    updateMutation.mutate({ id, updates: editingData });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingData({});
  };

  // Handle input change
  const handleInputChange = (field: keyof FuelQualityData, value: string | number) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value === '' ? null : Number(value),
    }));
  };

  // Handle sorting
  const handleSort = (key: keyof FuelQualityData) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' as const }
          : null;
      }
      return { key, direction: 'asc' as const };
    });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!fuelQualityData || !sortConfig) return fuelQualityData;

    return [...fuelQualityData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [fuelQualityData, sortConfig]);

  // Add new row mutation
  const addRowMutation = useMutation({
    mutationFn: async (newData: Partial<FuelQualityData>) => {
      const { error } = await supabase
        .from('fuel_quality_data')
        .insert([{ ...newData, account_id: accountId }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-quality-data', accountId] });
      toast.success(t('common:fuelQualityData.addSuccess'));
    },
    onError: () => {
      toast.error(t('common:fuelQualityData.addError'));
    },
  });

  // Handle add new row
  const handleAddNewRow = () => {
    const newRow: Partial<FuelQualityData> = {
      port: 'New Port',
      supplier: '',
      date: new Date().toISOString().split('T')[0],
      fuel_type: 'HFO',
      grade: '',
      density_15c: 0,
      k_viscosity_50c: 0,
      flash_point: 0,
      pour_point: 0,
      mcr: 0,
      ash: 0,
      water_content: 0,
      sulphur_content: 0,
      total_sediment: 0,
      vanadium: 0,
      sodium: 0,
      aluminium: 0,
      silicon: 0,
      aluminium_silicon: 0,
      calcium: 0,
      phosphorus: 0,
      zinc: 0,
      iron: 0,
      nickel: 0,
      lead: 0,
      potassium: 0,
      ccai: 0,
      net_specific_energy: 0,
      gross_specific_energy: 0,
    };

    addRowMutation.mutate(newRow);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Buttons Section */}
      <div className="flex gap-2 mb-4">
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              <Trans i18nKey="common:fuelQualityData.uploadExcelFile" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                <Trans i18nKey="common:fuelQualityData.fileUpload" />
              </DialogTitle>
            </DialogHeader>
            <UploadExcelDialog
              accountId={accountId}
              onSuccess={() => {
                setIsUploadDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['fuel-quality-data', accountId] });
              }}
            />
          </DialogContent>
        </Dialog>
        <Button 
          onClick={handleAddNewRow} 
          disabled={addRowMutation.isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          <Trans i18nKey="common:fuelQualityData.addNewRow" />
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent>
          <If condition={sortedData && sortedData.length > 0} fallback={
            <EmptyState
              icon={<Upload className="h-12 w-12" />}
              title={t('common:fuelQualityData.noData')}
              description={t('common:fuelQualityData.noDataDescription')}
            />
          }>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">
                      <div className="text-center">
                        <div className="font-medium flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.port" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('port')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-24">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.density15C" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('density_15c')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-24">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.kviscosity50C" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('k_viscosity_50c')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-20">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.pourPoint" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('pour_point')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-16">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.ash" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('ash')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-20">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.waterContent" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('water_content')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-20">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.sulphurContent" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('sulphur_content')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-16">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.vanadium" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('vanadium')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-16">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.sodium" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('sodium')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-20">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.aluminumSilicon" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('aluminium_silicon')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-20">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.totalAcidNumber" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('total_acid_number')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-16">
                      <div className="text-center">
                        <div className="font-medium text-xs flex items-center justify-center gap-1">
                          <Trans i18nKey="common:fuelQualityData.ccai" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('ccai')}
                            className="h-6 p-1"
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="w-32"><Trans i18nKey="common:fuelQualityData.action" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData?.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            value={editingData.port || ''}
                            onChange={(e) => handleInputChange('port', e.target.value)}
                            className="w-20 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.port}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.density_15c || ''}
                            onChange={(e) => handleInputChange('density_15c', e.target.value)}
                            className="w-16 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.density_15c?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.k_viscosity_50c || ''}
                            onChange={(e) => handleInputChange('k_viscosity_50c', e.target.value)}
                            className="w-16 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.k_viscosity_50c?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.pour_point || ''}
                            onChange={(e) => handleInputChange('pour_point', e.target.value)}
                            className="w-14 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.pour_point?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.ash || ''}
                            onChange={(e) => handleInputChange('ash', e.target.value)}
                            className="w-12 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.ash?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.water_content || ''}
                            onChange={(e) => handleInputChange('water_content', e.target.value)}
                            className="w-14 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.water_content?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.sulphur_content || ''}
                            onChange={(e) => handleInputChange('sulphur_content', e.target.value)}
                            className="w-14 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.sulphur_content?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.vanadium || ''}
                            onChange={(e) => handleInputChange('vanadium', e.target.value)}
                            className="w-12 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.vanadium?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.sodium || ''}
                            onChange={(e) => handleInputChange('sodium', e.target.value)}
                            className="w-12 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.sodium?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.aluminium_silicon || ''}
                            onChange={(e) => handleInputChange('aluminium_silicon', e.target.value)}
                            className="w-14 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.aluminium_silicon?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.total_sediment || ''}
                            onChange={(e) => handleInputChange('total_sediment', e.target.value)}
                            className="w-14 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.total_sediment?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingRow === row.id ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={editingData.ccai || ''}
                            onChange={(e) => handleInputChange('ccai', e.target.value)}
                            className="w-12 text-xs"
                          />
                        ) : (
                          <span className="text-xs">{row.ccai?.toFixed(4) || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {editingRow === row.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSave(row.id)}
                                disabled={updateMutation.isPending}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <Trans i18nKey="common:fuelQualityData.cancel" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadData(row)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      <Trans i18nKey="common:fuelQualityData.show" />
                                    </DialogTitle>
                                  </DialogHeader>
                                  <ViewDataDialog data={row} />
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(row)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      <Trans i18nKey="common:fuelQualityData.deleteConfirmTitle" />
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      <Trans i18nKey="common:fuelQualityData.deleteConfirmMessage" />
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      <Trans i18nKey="common:fuelQualityData.cancel" />
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(row.id)}
                                      disabled={deleteMutation.isPending}
                                    >
                                      <Trans i18nKey="common:fuelQualityData.delete" />
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </If>
        </CardContent>
      </Card>
    </div>
  );
}
