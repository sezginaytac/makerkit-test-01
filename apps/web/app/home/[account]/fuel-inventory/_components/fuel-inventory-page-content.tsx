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

  const handleSaveFuelData = () => {
    if (!selectedShipId) {
      toast.error(t('common:fuelInventory.selectShipFirst'));
      return;
    }
    
    // Remove total from data before sending to API (it's calculated on frontend only)
    const fuelDataArray = Object.values(fuelDataByType).map(({ total, ...rest }) => ({
      ...rest,
      port_id: selectedPortId || null,
    }));
    
    updateFuelDataMutation.mutate(fuelDataArray);
  };

  const handleAddPort = (portData: { port_name: string; eta_date: string }) => {
    if (!selectedShipId) {
      toast.error(t('common:fuelInventory.selectShipFirst'));
      return;
    }
    addPortMutation.mutate({
      ship_id: selectedShipId,
      port_name: portData.port_name,
      eta_date: portData.eta_date,
    });
  };

  // Mutations
  const updateFuelDataMutation = useMutation({
    mutationFn: async (fuelDataArray: Omit<FuelData, 'total'>[]) => {
      console.log('🔍 Mutation: Starting API call');
      console.log('🔍 Mutation: Fuel data array:', fuelDataArray);
      
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
      
      console.log('🔍 Mutation: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔍 Mutation: Error response:', errorText);
        throw new Error('Failed to update fuel data');
      }
      
      const result = await response.json();
      console.log('🔍 Mutation: Success response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🔍 Mutation: onSuccess called with:', data);
      queryClient.invalidateQueries({ queryKey: ['fuel-inventory', selectedShipId, accountId] });
      toast.success(t('common:fuelInventory.fuelDataUpdated'));
    },
    onError: (error) => {
      console.error('🔍 Mutation: onError called with:', error);
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
      console.error('🔍 Add Port Mutation: Error:', error);
      toast.error(t('common:fuelInventory.errorAddingPort'));
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
              <Select value={selectedShipId} onValueChange={handleShipChange}>
                <SelectTrigger>
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
                    <SelectTrigger>
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
                </div>
                <Dialog open={isAddPortDialogOpen} onOpenChange={setIsAddPortDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="ml-4">
                      <Plus className="mr-2 h-4 w-4" />
                      <Trans i18nKey="common:fuelInventory.addPort" />
                    </Button>
                  </DialogTrigger>
                  <AddPortDialog
                    onSubmit={handleAddPort}
                    isLoading={addPortMutation.isPending}
                    onCancel={() => setIsAddPortDialogOpen(false)}
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
                            onChange={(e) => handleFuelDataChange(fuelType, 'me', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            <Trans i18nKey="common:fuelInventory.tonsPerDay" />
                          </p>
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
                            onChange={(e) => handleFuelDataChange(fuelType, 'ae', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            <Trans i18nKey="common:fuelInventory.tonsPerDay" />
                          </p>
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
                            onChange={(e) => handleFuelDataChange(fuelType, 'boiler', parseFloat(e.target.value) || 0)}
                            className="h-8 text-sm"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            <Trans i18nKey="common:fuelInventory.tonsPerDay" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveFuelData}
                  disabled={updateFuelDataMutation.isPending}
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
  const [portData, setPortData] = useState({
    port_name: '',
    eta_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(portData);
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="port_name">
            <Trans i18nKey="common:fuelInventory.portToCall" />
          </Label>
          <Input
            id="port_name"
            type="text"
            placeholder={t('common:fuelInventory.portToCall')}
            value={portData.port_name}
            onChange={(e) => setPortData({ ...portData, port_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="eta_date">
            <Trans i18nKey="common:fuelInventory.eta" />
          </Label>
          <Input
            id="eta_date"
            type="datetime-local"
            value={portData.eta_date}
            onChange={(e) => setPortData({ ...portData, eta_date: e.target.value })}
            required
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            <Trans i18nKey="common:cancel" />
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Trans i18nKey="common:saving" /> : <Trans i18nKey="common:fuelInventory.save" />}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}