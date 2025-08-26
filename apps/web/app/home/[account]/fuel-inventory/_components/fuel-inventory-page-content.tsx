'use client';

import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@kit/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import { Trans } from '@kit/ui/trans';
import { toast } from '@kit/ui/sonner';
import { Save, Plus, Fuel } from 'lucide-react';
import { fuelManagerConfig } from '~/config/fuel-manager.config';
import Decimal from 'decimal.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { FuelDataSchema, PortDataSchema, type FuelDataForm, type PortDataForm } from '../_lib/schema/fuel-inventory.schema';
import { ShipForm } from '../../ships/_components/ships-page-content';

// Utility function for exact mathematical calculations
const calculateExactSum = (...values: number[]): number => {
  return values.reduce((sum, value) => {
    return new Decimal(sum).plus(new Decimal(value)).toNumber();
  }, 0);
};

interface Ship {
  id: string;
  name: string;
  imo_number: string;
  vessel_type: string;
  fuel_types: string;
}

interface Port {
  id?: string;
  ship_id: string;
  port_name: string;
  eta_date: string;
}

interface FuelData {
  id?: string;
  ship_id: string;
  fuel_type: string;
  rob: number;
  me: number;
  ae: number;
  boiler: number;
  port_id?: string | null;
  total?: number; // Optional since it's calculated on frontend only
}

interface FuelDataByType {
  [fuelType: string]: FuelData;
}

interface FuelInventoryPageContentProps {
  accountId: string;
}

export function FuelInventoryPageContent({ accountId }: FuelInventoryPageContentProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [selectedShipId, setSelectedShipId] = useState<string>('');
  const [selectedPortId, setSelectedPortId] = useState<string>('');
  const [isAddPortDialogOpen, setIsAddPortDialogOpen] = useState(false);
  const [isAddShipDialogOpen, setIsAddShipDialogOpen] = useState(false);

  // Reset form when dialog opens
  const handleAddPortDialogOpen = (open: boolean) => {
    setIsAddPortDialogOpen(open);
    if (open) {
      // Reset port form when opening
      setSelectedPortId('');
    }
  };

  const handleAddShipDialogOpen = (open: boolean) => {
    setIsAddShipDialogOpen(open);
  };
  const [fuelDataByType, setFuelDataByType] = useState<FuelDataByType>({});

  // Fetch ships
  const { data: ships = [], isLoading: shipsLoading } = useQuery({
    queryKey: ['ships', accountId],
    queryFn: async () => {
      const response = await fetch(`/api/fuel-manager/ships?accountId=${accountId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ships');
      }
      return response.json();
    },
  });

  // Fetch ports
  const { data: ports = [], isLoading: portsLoading } = useQuery({
    queryKey: ['ports', accountId],
    queryFn: async () => {
      const response = await fetch(`/api/fuel-manager/ports?accountId=${accountId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ports');
      }
      const data = await response.json();
      return data;
    },
    enabled: !!accountId,
  });

  // Fetch fuel data for selected ship
  const { data: existingFuelData, isLoading: fuelDataLoading } = useQuery({
    queryKey: ['fuel-inventory', selectedShipId, accountId],
    queryFn: async () => {
      if (!selectedShipId) return null;
      const response = await fetch(`/api/fuel-manager/fuel-inventory/${selectedShipId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fuel data API error:', errorText);
        throw new Error('Failed to fetch fuel data');
      }
      const data = await response.json();
      return data;
    },
    enabled: !!selectedShipId && !!accountId,
  });

  const selectedShip = ships.find((ship: Ship) => ship.id === selectedShipId);
  const selectedPort = ports.find((port: any) => port.id === selectedPortId);

  const fuelTypes = useMemo(() => {
    return selectedShip?.fuel_types ? selectedShip.fuel_types.split(',').map((t: string) => t.trim()) : [];
  }, [selectedShip?.fuel_types]);

  // Initialize fuel data when ship changes
  useEffect(() => {
    if (selectedShipId && selectedShip && existingFuelData) {
      const currentFuelTypes = selectedShip.fuel_types ? selectedShip.fuel_types.split(',').map((t: string) => t.trim()) : [];

      if (currentFuelTypes.length > 0) {
        const initialFuelData: FuelDataByType = {};

        // Find any existing data to get the port_id (all fuel types should have the same port_id)
        const anyExistingData = existingFuelData.find((data: FuelData) => data.port_id);
        
        if (anyExistingData?.port_id) {
          setSelectedPortId(anyExistingData.port_id);
        }

        currentFuelTypes.forEach((fuelType: string) => {
          // Find existing data for this fuel type
          const existingData = existingFuelData.find((data: FuelData) => data.fuel_type === fuelType);
          const normalizedFuelType = fuelType.toLowerCase() as keyof typeof fuelManagerConfig.defaultRobValues;
          const defaultRob = fuelManagerConfig.defaultRobValues[normalizedFuelType] || 0;

          const me = existingData?.me || 0;
          const ae = existingData?.ae || 0;
          const boiler = existingData?.boiler || 0;
          const total = calculateExactSum(me, ae, boiler);

          initialFuelData[fuelType] = {
            id: existingData?.id,
            ship_id: selectedShipId,
            fuel_type: fuelType,
            rob: existingData?.rob || defaultRob, // Use existing R.O.B. or default
            me: me,
            ae: ae,
            boiler: boiler,
            port_id: existingData?.port_id || null,
            total: total,
          };
        });

        setFuelDataByType(initialFuelData);
      }
    }
  }, [selectedShipId, selectedShip?.fuel_types, existingFuelData]);

  const handleShipChange = (shipId: string) => {
    setSelectedShipId(shipId);
    setSelectedPortId(''); // Reset port selection when ship changes
  };

  const handlePortChange = (portId: string) => {
    setSelectedPortId(portId);
  };

  const handleFuelDataChange = (fuelType: string, field: keyof FuelData, value: number) => {
    setFuelDataByType(prev => {
      const currentData = prev[fuelType] || {
        ship_id: selectedShipId,
        fuel_type: fuelType,
        rob: 0,
        me: 0,
        ae: 0,
        boiler: 0,
        total: 0,
      };

      const updatedData = { ...currentData, [field]: value };

      // Recalculate total with proper precision (only for display)
      if (field === 'me' || field === 'ae' || field === 'boiler') {
        const total = calculateExactSum(updatedData.me, updatedData.ae, updatedData.boiler);
        updatedData.total = total;
      }

      return {
        ...prev,
        [fuelType]: updatedData,
      };
    });
  };

  const isFormValid = useMemo(() => {
    if (!selectedShipId || !selectedPortId) {
      return false;
    }

    // Check if all fuel data has valid values
    const fuelDataArray = Object.values(fuelDataByType);
    return fuelDataArray.every(fuelData => 
      fuelData.me > 0 && fuelData.ae > 0 && fuelData.boiler > 0
    );
  }, [selectedShipId, selectedPortId, fuelDataByType]);

  const validateFuelData = () => {
    if (!selectedShipId) {
      toast.error(t('common:validation.shipRequired'));
      return false;
    }

    if (!selectedPortId) {
      toast.error(t('common:validation.portNameRequired'));
      return false;
    }

    // Validate fuel data
    const fuelDataArray = Object.values(fuelDataByType).map(({ total, ...rest }) => ({
      ...rest,
      port_id: selectedPortId || null,
    }));

    // Validate each fuel data entry
    for (const fuelData of fuelDataArray) {
      if (fuelData.me <= 0) {
        toast.error(t('common:validation.meMinValue'));
        return false;
      }
      if (fuelData.ae <= 0) {
        toast.error(t('common:validation.aeMinValue'));
        return false;
      }
      if (fuelData.boiler <= 0) {
        toast.error(t('common:validation.boilerMinValue'));
        return false;
      }
    }
    
    return true;
  };

  const handleSaveFuelData = () => {
    if (!validateFuelData()) {
      return;
    }
    
    const fuelDataArray = Object.values(fuelDataByType).map(({ total, ...rest }) => ({
      ...rest,
      port_id: selectedPortId || null,
    }));
    
    updateFuelDataMutation.mutate(fuelDataArray);
  };

  const handleAddPort = (portData: { port_name: string; eta_date: string }) => {
    if (!selectedShipId) {
      toast.error(t('common:validation.shipRequired'));
      return;
    }
    
    // Validate port data
    if (!portData.port_name.trim()) {
      toast.error(t('common:validation.portNameRequired'));
      return;
    }
    
    if (!portData.eta_date) {
      toast.error(t('common:validation.etaRequired'));
      return;
    }
    
    // Validate ETA date is not in the past
    const etaDate = new Date(portData.eta_date);
    const now = new Date();
    if (etaDate <= now) {
      toast.error(t('common:validation.etaFuture'));
      return;
    }
    
    addPortMutation.mutate({
      ship_id: selectedShipId,
      port_name: portData.port_name.trim(),
      eta_date: portData.eta_date,
    });
  };

  // Mutations
  const updateFuelDataMutation = useMutation({
    mutationFn: async (fuelDataArray: Omit<FuelData, 'total'>[]) => {
      const response = await fetch('/api/fuel-manager/fuel-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fuelData: fuelDataArray,
          accountId: accountId,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to update fuel data');
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['fuel-inventory', selectedShipId, accountId] });
      toast.success(t('common:fuelInventory.fuelDataUpdated'));
    },
    onError: (error) => {
      console.error('Error updating fuel data:', error);
      toast.error(t('common:fuelInventory.errorUpdatingFuel'));
    },
  });

  const addPortMutation = useMutation({
    mutationFn: async (portData: { ship_id: string; port_name: string; eta_date: string }) => {
      const response = await fetch('/api/fuel-manager/ports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...portData,
          accountId: accountId,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Failed to add port');
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ports', accountId] });
      setIsAddPortDialogOpen(false);
      toast.success(t('common:fuelInventory.portAdded'));
    },
    onError: (error) => {
      console.error('Error adding port:', error);
      toast.error(t('common:fuelInventory.errorAddingPort'));
    },
  });

  const createShipMutation = useMutation({
    mutationFn: async (shipData: Partial<Ship>) => {
      console.log('Creating ship with data:', shipData);
      console.log('Account ID:', accountId);
      
      const response = await fetch('/api/fuel-manager/ships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...shipData,
          accountId,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Failed to create ship');
      }

      const result = await response.json();
      console.log('Success response:', result);
      return result;
    },
    onSuccess: () => {
      toast.success(t('common:shipCreatedSuccessfully'));
      setIsAddShipDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ships', accountId] });
    },
    onError: (error) => {
      console.error('Error creating ship:', error);
      toast.error(t('common:errorCreatingShip'));
    },
  });

  if (shipsLoading || portsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">
            <Trans i18nKey="common:loading" />
          </div>
        </div>
      </div>
    );
  }

  if (ships.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Fuel className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              <Trans i18nKey="common:fuelInventory.noShipsAvailable" />
            </h3>
            <p className="text-muted-foreground">
              <Trans i18nKey="common:shipsManagementDescription" />
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ship Selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey="common:fuelInventory.selectShip" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>
                <Trans i18nKey="common:fuelInventory.selectShip" />
              </Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Select value={selectedShipId} onValueChange={handleShipChange}>
                    <SelectTrigger className={!selectedShipId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('common:fuelInventory.selectShipPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ships.map((ship: Ship) => (
                        <SelectItem key={ship.id} value={ship.id}>
                          {ship.name} ({ship.imo_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedShipId && (
                    <p className="text-sm text-destructive mt-1">
                      <Trans i18nKey="common:validation.shipRequired" defaults="Please select a ship" />
                    </p>
                  )}
                </div>
                <Dialog open={isAddShipDialogOpen} onOpenChange={handleAddShipDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      <Trans i18nKey="common:addShip" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        <Trans i18nKey="common:addNewShip" />
                      </DialogTitle>
                      <DialogDescription>
                        <Trans i18nKey="common:addShipDescription" />
                      </DialogDescription>
                    </DialogHeader>
                    <ShipForm
                      key={`add-ship-${isAddShipDialogOpen}`}
                      onSubmit={(data) => createShipMutation.mutate(data)}
                      isLoading={createShipMutation.isPending}
                      onCancel={() => handleAddShipDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {selectedShip && (
              <div>
                <h3 className="text-lg font-semibold">
                  {t('common:fuelInventory.fuelDataFor', { shipName: selectedShip.name })}
                </h3>
                <p className="text-muted-foreground">
                  {selectedShip.vessel_type} • {selectedShip.imo_number}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Port Selection */}
      {selectedShip && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey="common:fuelInventory.selectPortOfCall" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Select value={selectedPortId} onValueChange={handlePortChange}>
                    <SelectTrigger className={!selectedPortId && selectedShipId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={t('common:fuelInventory.selectPortPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const filteredPorts = ports.filter((port: any) => port.ship_id === selectedShipId);
                        return filteredPorts.map((port: any) => (
                          <SelectItem key={port.id} value={port.id}>
                            {port.port_name} - {new Date(port.eta_date).toLocaleDateString()}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                  {!selectedPortId && selectedShipId && (
                    <p className="text-sm text-destructive mt-1">
                      <Trans i18nKey="common:validation.portNameRequired" defaults="Port name is required" />
                    </p>
                  )}
                </div>
                <Dialog open={isAddPortDialogOpen} onOpenChange={handleAddPortDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="ml-4">
                      <Plus className="mr-2 h-4 w-4" />
                      <Trans i18nKey="common:fuelInventory.addPort" />
                    </Button>
                  </DialogTrigger>
                  <AddPortDialog
                    key={`add-port-${isAddPortDialogOpen}`}
                    onSubmit={handleAddPort}
                    isLoading={addPortMutation.isPending}
                    onCancel={() => handleAddPortDialogOpen(false)}
                  />
                </Dialog>
              </div>

              {selectedPort && (
                <div>
                  <p className="text-muted-foreground">
                    <Trans i18nKey="common:fuelInventory.eta" />: {new Date(selectedPort.eta_date).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fuel Data Form */}
      {selectedShip && fuelTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey="common:fuelInventory.updateFuelData" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Fuel Data Grid for each fuel type */}
              {fuelTypes.map((fuelType: string) => {
                const fuelData = fuelDataByType[fuelType] || {
                  ship_id: selectedShipId,
                  fuel_type: fuelType,
                  rob: 0,
                  me: 0,
                  ae: 0,
                  boiler: 0,
                  total: 0,
                };

                return (
                  <div key={fuelType} className="border rounded-lg p-3 space-y-3">
                    <h4 className="font-medium text-base border-b pb-2 mb-3">
                      {t(`common:fuelTypesOptions.${fuelType.toLowerCase()}` as any, fuelType)}
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {/* Fuel Remaining Onboard (Read-only) */}
                      <div>
                        <Label htmlFor={`rob-${fuelType}`} className="text-sm">
                          <Trans i18nKey="common:fuelInventory.fuelRemainingOnboard" />
                        </Label>
                        <Input
                          id={`rob-${fuelType}`}
                          type="number"
                          value={fuelData.rob}
                          readOnly
                          className="bg-muted h-8 text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          <Trans i18nKey="common:fuelInventory.tons" />
                        </p>
                      </div>

                      {/* Total (Read-only) */}
                      <div>
                        <Label htmlFor={`total-${fuelType}`} className="text-sm">
                          <Trans i18nKey="common:fuelInventory.total" />
                        </Label>
                        <Input
                          id={`total-${fuelType}`}
                          type="number"
                          value={fuelData.total}
                          readOnly
                          className="bg-muted font-semibold h-8 text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          <Trans i18nKey="common:fuelInventory.tonsPerDay" />
                        </p>
                      </div>
                    </div>

                    {/* Daily Fuel Consumption */}
                    <div>
                      <h5 className="font-medium text-sm mb-2">
                        <Trans i18nKey="common:fuelInventory.dailyFuelConsumption" />
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor={`me-${fuelType}`} className="text-xs">
                            <Trans i18nKey="common:fuelInventory.mainEngine" />
                          </Label>
                          <Input
                            id={`me-${fuelType}`}
                            type="number"
                            step="0.001"
                            value={fuelData.me}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (value >= 0) {
                                handleFuelDataChange(fuelType, 'me', value);
                              }
                            }}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (value <= 0) {
                                e.target.classList.add('border-destructive');
                              } else {
                                e.target.classList.remove('border-destructive');
                              }
                            }}
                            className={`h-8 text-sm ${fuelData.me <= 0 ? 'border-destructive' : ''}`}
                            min="0"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            <Trans i18nKey="common:fuelInventory.tonsPerDay" />
                          </p>
                          {fuelData.me <= 0 && (
                            <p className="text-xs text-destructive mt-1">
                              <Trans i18nKey="common:validation.meMinValue" defaults="Main Engine consumption must be greater than 0" />
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`ae-${fuelType}`} className="text-xs">
                            <Trans i18nKey="common:fuelInventory.auxiliaryEngine" />
                          </Label>
                          <Input
                            id={`ae-${fuelType}`}
                            type="number"
                            step="0.001"
                            value={fuelData.ae}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (value >= 0) {
                                handleFuelDataChange(fuelType, 'ae', value);
                              }
                            }}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (value <= 0) {
                                e.target.classList.add('border-destructive');
                              } else {
                                e.target.classList.remove('border-destructive');
                              }
                            }}
                            className={`h-8 text-sm ${fuelData.ae <= 0 ? 'border-destructive' : ''}`}
                            min="0"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            <Trans i18nKey="common:fuelInventory.tonsPerDay" />
                          </p>
                          {fuelData.ae <= 0 && (
                            <p className="text-xs text-destructive mt-1">
                              <Trans i18nKey="common:validation.aeMinValue" defaults="Auxiliary Engine consumption must be greater than 0" />
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`boiler-${fuelType}`} className="text-xs">
                            <Trans i18nKey="common:fuelInventory.boiler" />
                          </Label>
                          <Input
                            id={`boiler-${fuelType}`}
                            type="number"
                            step="0.001"
                            value={fuelData.boiler}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (value >= 0) {
                                handleFuelDataChange(fuelType, 'boiler', value);
                              }
                            }}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (value <= 0) {
                                e.target.classList.add('border-destructive');
                              } else {
                                e.target.classList.remove('border-destructive');
                              }
                            }}
                            className={`h-8 text-sm ${fuelData.boiler <= 0 ? 'border-destructive' : ''}`}
                            min="0"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            <Trans i18nKey="common:fuelInventory.tonsPerDay" />
                          </p>
                          {fuelData.boiler <= 0 && (
                            <p className="text-xs text-destructive mt-1">
                              <Trans i18nKey="common:validation.boilerMinValue" defaults="Boiler consumption must be greater than 0" />
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveFuelData}
                  disabled={updateFuelDataMutation.isPending || !isFormValid}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateFuelDataMutation.isPending ? (
                    <Trans i18nKey="common:saving" />
                  ) : (
                    <Trans i18nKey="common:fuelInventory.save" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add Port Dialog Component
function AddPortDialog({
  onSubmit,
  isLoading,
  onCancel,
}: {
  onSubmit: (data: { port_name: string; eta_date: string }) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  
  const form = useForm<PortDataForm>({
    resolver: zodResolver(PortDataSchema),
    defaultValues: {
      port_name: '',
      eta_date: '',
    },
  });

  const handleSubmit = (data: PortDataForm) => {
    onSubmit(data);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          <Trans i18nKey="common:fuelInventory.addPort" />
        </DialogTitle>
        <DialogDescription>
          <Trans i18nKey="common:fuelInventory.addPortDescription" defaults="Add a new port call for the selected ship." />
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="port_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="common:fuelInventory.portToCall" />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('common:fuelInventory.portToCall')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eta_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="common:fuelInventory.eta" />
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCancel}>
              <Trans i18nKey="common:cancel" />
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Trans i18nKey="common:saving" /> : <Trans i18nKey="common:fuelInventory.save" />}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}