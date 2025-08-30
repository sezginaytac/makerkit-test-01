'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Separator } from '@kit/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';
import { toast } from '@kit/ui/sonner';
import { useTranslation } from 'react-i18next';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { ShipSchema, type ShipForm as ShipFormType } from '../_lib/schema/ship.schema';

interface Ship {
  id: string;
  name: string;
  imo_number: string;
  vessel_type?: string;
  capacity?: number;
  fuel_consumption_rate?: number;
  fuel_types?: string; // New field for comma-separated fuel types
  created_at: string;
  updated_at: string;
}

interface ShipsPageContentProps {
  accountId: string;
}

export function ShipsPageContent({ accountId }: ShipsPageContentProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<Ship | null>(null);
  const [deletingShip, setDeletingShip] = useState<Ship | null>(null);

  const queryClient = useQueryClient();

  const itemsPerPage = 10;

  // Fetch ships
  const { data: ships = [], isLoading, error } = useQuery({
    queryKey: ['ships', accountId],
    queryFn: async () => {
      const response = await fetch('/api/fuel-manager/ships');
      if (!response.ok) {
        throw new Error('Failed to fetch ships');
      }
      return response.json();
    },
  });

  // Create ship mutation
  const createShipMutation = useMutation({
    mutationFn: async (shipData: Partial<Ship>) => {
      const response = await fetch('/api/fuel-manager/ships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...shipData,
          accountId: accountId,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create ship');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ships', accountId] });
      setIsCreateDialogOpen(false);
      toast.success(t('common:shipCreatedSuccessfully'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update ship mutation
  const updateShipMutation = useMutation({
    mutationFn: async ({ id, ...shipData }: Ship) => {
      const response = await fetch(`/api/fuel-manager/ships/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...shipData,
          accountId: accountId,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ship');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ships', accountId] });
      setEditingShip(null);
      toast.success(t('common:shipUpdatedSuccessfully'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete ship mutation
  const deleteShipMutation = useMutation({
    mutationFn: async (shipId: string) => {
      const response = await fetch(`/api/fuel-manager/ships/${shipId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete ship');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ships', accountId] });
      setDeletingShip(null);
      toast.success(t('common:shipDeletedSuccessfully'));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Filter ships based on search term
  const filteredShips = ships.filter((ship: Ship) =>
    ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.imo_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ship.vessel_type && ship.vessel_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredShips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShips = filteredShips.slice(startIndex, startIndex + itemsPerPage);

     if (error) {
     return (
       <Card>
         <CardContent className="p-6">
           <div className="text-center text-red-600">
             {t('common:errorLoadingShips')}: {error.message}
           </div>
         </CardContent>
       </Card>
     );
   }

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-2xl font-bold tracking-tight">
             <Trans i18nKey="common:shipsManagement" />
           </h2>
           <p className="text-muted-foreground">
             <Trans i18nKey="common:shipsManagementDescription" />
           </p>
         </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
               key={`create-ship-${isCreateDialogOpen}`}
               onSubmit={(data) => createShipMutation.mutate(data)}
               isLoading={createShipMutation.isPending}
               onCancel={() => setIsCreateDialogOpen(false)}
             />
           </DialogContent>
         </Dialog>
      </div>

             {/* Search and Filters */}
       <Card>
         <CardContent className="p-6">
           <div className="flex items-center space-x-4">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               <Input
                 placeholder={t('common:searchShips')}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10"
               />
             </div>
             <Button variant="outline" size="sm">
               <Filter className="mr-2 h-4 w-4" />
               <Trans i18nKey="common:filters" />
             </Button>
           </div>
         </CardContent>
       </Card>

             {/* Ships Table */}
       <Card>
         <CardHeader>
           <CardTitle>
             <Trans i18nKey="common:ships" /> ({filteredShips.length})
           </CardTitle>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="flex items-center justify-center p-12">
               <div className="flex flex-col items-center space-y-2">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                 <div className="text-muted-foreground">
                   <Trans i18nKey="common:loadingShips" />
                 </div>
               </div>
             </div>
           ) : paginatedShips.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-center">
               <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                 <Plus className="h-8 w-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-semibold mb-2">
                 {searchTerm ? t('common:noShipsFound') : t('common:noShipsYet')}
               </h3>
               <p className="text-muted-foreground mb-6 max-w-sm">
                 {searchTerm 
                   ? t('common:noShipsFoundDescription')
                   : t('common:noShipsYetDescription')
                 }
               </p>
               {!searchTerm && (
                 <Button onClick={() => setIsCreateDialogOpen(true)}>
                   <Plus className="mr-2 h-4 w-4" />
                   <Trans i18nKey="common:addYourFirstShip" />
                 </Button>
               )}
             </div>
           ) : (
             <div className="space-y-4">
               {paginatedShips.map((ship: Ship) => (
                 <ShipCard
                   key={ship.id}
                   ship={ship}
                   onEdit={() => setEditingShip(ship)}
                   onDelete={() => setDeletingShip(ship)}
                 />
               ))}
             </div>
           )}
         </CardContent>
       </Card>

             {/* Pagination */}
       {totalPages > 1 && (
         <div className="flex items-center justify-between">
           <div className="text-sm text-muted-foreground">
             {t('common:showingResults', {
               start: startIndex + 1,
               end: Math.min(startIndex + itemsPerPage, filteredShips.length),
               total: filteredShips.length
             })}
           </div>
           <div className="flex items-center space-x-2">
             <Button
               variant="outline"
               size="sm"
               onClick={() => setCurrentPage(currentPage - 1)}
               disabled={currentPage === 1}
             >
               <Trans i18nKey="common:previous" />
             </Button>
             <div className="flex items-center space-x-1">
               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                 <Button
                   key={page}
                   variant={currentPage === page ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setCurrentPage(page)}
                 >
                   {page}
                 </Button>
               ))}
             </div>
             <Button
               variant="outline"
               size="sm"
               onClick={() => setCurrentPage(currentPage + 1)}
               disabled={currentPage === totalPages}
             >
               <Trans i18nKey="common:next" />
             </Button>
           </div>
         </div>
       )}

             {/* Edit Dialog */}
       {editingShip && (
         <Dialog open={!!editingShip} onOpenChange={() => setEditingShip(null)}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>
                 <Trans i18nKey="common:editShip" />
               </DialogTitle>
               <DialogDescription>
                 <Trans i18nKey="common:editShipDescription" />
               </DialogDescription>
             </DialogHeader>
            <ShipForm
              ship={editingShip}
              onSubmit={(data) => updateShipMutation.mutate({ ...editingShip, ...data })}
              isLoading={updateShipMutation.isPending}
              onCancel={() => setEditingShip(null)}
            />
          </DialogContent>
        </Dialog>
      )}

             {/* Delete Confirmation */}
       {deletingShip && (
         <AlertDialog open={!!deletingShip} onOpenChange={() => setDeletingShip(null)}>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>
                 <Trans i18nKey="common:deleteShip" />
               </AlertDialogTitle>
               <AlertDialogDescription>
                 {(() => {
                   const baseText = t('common:deleteShipDescription');
                   const interpolatedText = baseText.replace('{name}', `"${deletingShip.name}"`);
                   return interpolatedText;
                 })()}
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
               <AlertDialogCancel>
                 <Trans i18nKey="common:cancel" />
               </AlertDialogCancel>
               <AlertDialogAction
                 onClick={() => deleteShipMutation.mutate(deletingShip.id)}
                 className="bg-red-600 hover:bg-red-700"
               >
                 <Trans i18nKey="common:delete" />
               </AlertDialogAction>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
       )}
    </div>
  );
}

 // Ship Card Component
 function ShipCard({ ship, onEdit, onDelete }: { ship: Ship; onEdit: () => void; onDelete: () => void }) {
   const { t } = useTranslation();
   
   // Parse fuel types from comma-separated string
   const fuelTypes = ship.fuel_types ? ship.fuel_types.split(',').map(t => t.trim()) : [];
   
   return (
     <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
       <CardContent className="p-6">
         <div className="flex items-start justify-between">
           <div className="flex-1">
             <div className="flex items-center space-x-3 mb-4">
               <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                 <span className="text-primary font-semibold text-sm">
                   {ship.name.charAt(0).toUpperCase()}
                 </span>
               </div>
               <div>
                 <h3 className="text-lg font-semibold">{ship.name}</h3>
                 <Badge variant="secondary" className="text-xs">{ship.imo_number}</Badge>
               </div>
             </div>
             
                                  {/* Fuel Types */}
                     {fuelTypes.length > 0 && (
                       <div className="mb-4">
                         <span className="text-sm font-medium text-foreground mb-2 block">
                           <Trans i18nKey="common:fuelTypes" defaults="Fuel Types" />:
                         </span>
                         <div className="flex flex-wrap gap-1">
                           {fuelTypes.map((fuelType) => (
                             <Badge key={fuelType} variant="outline" className="text-xs">
                               {fuelType}
                             </Badge>
                           ))}
                         </div>
                       </div>
                     )}
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
               {ship.vessel_type && (
                 <div className="flex flex-col">
                   <span className="font-medium text-foreground">
                     <Trans i18nKey="common:vesselType" />
                   </span>
                   <span className="text-muted-foreground">{ship.vessel_type}</span>
                 </div>
               )}
               {ship.capacity && (
                 <div className="flex flex-col">
                   <span className="font-medium text-foreground">
                     <Trans i18nKey="common:capacity" />
                   </span>
                   <span className="text-muted-foreground">{ship.capacity.toLocaleString()} {t('common:tons')}</span>
                 </div>
               )}
               {ship.fuel_consumption_rate && (
                 <div className="flex flex-col">
                   <span className="font-medium text-foreground">
                     <Trans i18nKey="common:fuelConsumptionRate" />
                   </span>
                   <span className="text-muted-foreground">{ship.fuel_consumption_rate} {t('common:tonsPerDay')}</span>
                 </div>
               )}
               <div className="flex flex-col">
                 <span className="font-medium text-foreground">
                   <Trans i18nKey="common:created" />
                 </span>
                 <span className="text-muted-foreground">{new Date(ship.created_at).toLocaleDateString()}</span>
               </div>
             </div>
           </div>
           <div className="flex items-center space-x-2 ml-4">
             <Button variant="outline" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
               <Edit className="h-4 w-4" />
             </Button>
             <Button variant="outline" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
               <Trash2 className="h-4 w-4" />
             </Button>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }

 // Ship Form Component
 function ShipForm({ 
  ship, 
  onSubmit, 
  isLoading, 
  onCancel 
}: { 
  ship?: Ship | null; 
  onSubmit: (data: Partial<Ship>) => void; 
  isLoading: boolean; 
  onCancel: () => void; 
}) {
  const { t } = useTranslation();
  
  // Parse existing fuel types from comma-separated string
  const existingFuelTypes = ship?.fuel_types ? ship.fuel_types.split(',').map(t => t.trim()) : [];
  
  const form = useForm<ShipFormType>({
    resolver: zodResolver(ShipSchema),
    defaultValues: {
      name: ship?.name || '',
      imo_number: ship?.imo_number || '',
      vessel_type: ship?.vessel_type || '',
      capacity: ship?.capacity ? Number(ship.capacity) : 0,
      fuel_consumption_rate: ship?.fuel_consumption_rate ? Number(ship.fuel_consumption_rate) : 0,
      fuel_types: ship?.fuel_types || 'HFO,VLSFO,ULSFO',
    },
  });
  
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(existingFuelTypes.length > 0 ? existingFuelTypes : ['HFO', 'VLSFO', 'ULSFO']);

  // Reset form when ship prop changes (for new ship creation)
  useEffect(() => {
    if (!ship) {
      // Reset form for new ship
      form.reset({
        name: '',
        imo_number: '',
        vessel_type: '',
        capacity: 0,
        fuel_consumption_rate: 0,
        fuel_types: 'HFO,VLSFO,ULSFO',
      });
      setSelectedFuelTypes(['HFO', 'VLSFO', 'ULSFO']);
    }
  }, [ship, form]);

  // Check if form is valid
  const isFormValid = form.formState.isValid && selectedFuelTypes.length > 0 && 
    /^\d{7}$/.test(form.getValues('imo_number'));

  const fuelTypeOptions = [
             { value: 'HFO', label: <Trans i18nKey="common:fuelTypesOptions.hfo" defaults="HFO (Heavy Fuel Oil)" /> },
             { value: 'VLSFO', label: <Trans i18nKey="common:fuelTypesOptions.vlsfo" defaults="VLSFO (Very Low Sulphur Fuel Oil)" /> },
             { value: 'ULSFO', label: <Trans i18nKey="common:fuelTypesOptions.ulsfo" defaults="ULSFO (Ultra Low Sulphur Fuel Oil)" /> },
           ];

  const handleFuelTypeChange = (fuelType: string, checked: boolean) => {
    if (checked) {
      setSelectedFuelTypes(prev => [...prev, fuelType]);
    } else {
      setSelectedFuelTypes(prev => prev.filter(t => t !== fuelType));
    }
  };

  const handleSubmit = (data: ShipFormType) => {
    // Validate that at least one fuel type is selected
    if (selectedFuelTypes.length === 0) {
      toast.error(t('common:validation.fuelTypesRequired'));
      return;
    }
    
    // Validate IMO number format
    if (!/^\d{7}$/.test(data.imo_number)) {
      toast.error(t('common:validation.imoNumberFormat'));
      return;
    }
    
    onSubmit({
      ...data,
      capacity: data.capacity || 0,
      fuel_consumption_rate: data.fuel_consumption_rate || 0,
      fuel_types: selectedFuelTypes.join(','),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="common:shipName" /> *
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('common:shipName')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imo_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="common:imoNumber" /> *
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('common:imoNumber')} 
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
                {field.value && !/^\d{7}$/.test(field.value) && (
                  <p className="text-sm text-destructive">
                    <Trans i18nKey="common:validation.imoNumberFormat" defaults="IMO number must be exactly 7 digits" />
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vessel_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="common:vesselType" />
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Container Ship, Tanker" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="common:capacityTons" />
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g., 50000" 
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fuel_consumption_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="common:fuelConsumptionRateTonsPerDay" />
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g., 25.5" 
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fuel Types Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            <Trans i18nKey="common:fuelTypes" defaults="Fuel Types" /> *
          </Label>
          <div className="space-y-2">
            {fuelTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`fuel-type-${option.value}`}
                  checked={selectedFuelTypes.includes(option.value)}
                  onChange={(e) => handleFuelTypeChange(option.value, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                       />
                       <Label htmlFor={`fuel-type-${option.value}`} className="text-sm font-normal">
                         {option.label}
                       </Label>
                     </div>
                   ))}
                 </div>
                 {selectedFuelTypes.length === 0 && (
                   <p className="text-sm text-red-600">
                     <Trans i18nKey="common:fuelTypesRequired" defaults="Please select at least one fuel type" />
                   </p>
                 )}
               </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            <Trans i18nKey="common:cancel" />
          </Button>
          <Button type="submit" disabled={isLoading || !isFormValid}>
            {isLoading ? (
              <Trans i18nKey="common:saving" />
            ) : ship ? (
              <Trans i18nKey="common:updateShip" />
            ) : (
              <Trans i18nKey="common:createShip" />
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export { ShipForm };
export default ShipsPageContent;
