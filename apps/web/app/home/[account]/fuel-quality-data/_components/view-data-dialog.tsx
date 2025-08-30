'use client';

import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Trans } from '@kit/ui/trans';

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

interface ViewDataDialogProps {
  data: FuelQualityData;
}

export function ViewDataDialog({ data }: ViewDataDialogProps) {
  const { t } = useTranslation();

  const formatValue = (value: number | undefined) => {
    if (value === undefined || value === null) return '-';
    return value.toFixed(4);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.port" />
              </label>
              <p className="text-sm">{data.port}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Supplier</label>
              <p className="text-sm">{data.supplier || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date</label>
              <p className="text-sm">{formatDate(data.date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fuel Type</label>
              <p className="text-sm">{data.fuel_type || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Grade</label>
              <p className="text-sm">{data.grade || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.density15C" />
              </label>
              <p className="text-sm">{formatValue(data.density_15c)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.kviscosity50C" />
              </label>
              <p className="text-sm">{formatValue(data.k_viscosity_50c)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Flash Point</label>
              <p className="text-sm">{formatValue(data.flash_point)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.pourPoint" />
              </label>
              <p className="text-sm">{formatValue(data.pour_point)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">MCR</label>
              <p className="text-sm">{formatValue(data.mcr)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contaminants */}
      <Card>
        <CardHeader>
          <CardTitle>Contaminants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.ash" />
              </label>
              <p className="text-sm">{formatValue(data.ash)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.waterContent" />
              </label>
              <p className="text-sm">{formatValue(data.water_content)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.sulphurContent" />
              </label>
              <p className="text-sm">{formatValue(data.sulphur_content)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Sediment</label>
              <p className="text-sm">{formatValue(data.total_sediment)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metals */}
      <Card>
        <CardHeader>
          <CardTitle>Metals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.vanadium" />
              </label>
              <p className="text-sm">{formatValue(data.vanadium)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.sodium" />
              </label>
              <p className="text-sm">{formatValue(data.sodium)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Aluminium</label>
              <p className="text-sm">{formatValue(data.aluminium)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Silicon</label>
              <p className="text-sm">{formatValue(data.silicon)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.aluminumSilicon" />
              </label>
              <p className="text-sm">{formatValue(data.aluminium_silicon)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Calcium</label>
              <p className="text-sm">{formatValue(data.calcium)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phosphorus</label>
              <p className="text-sm">{formatValue(data.phosphorus)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Zinc</label>
              <p className="text-sm">{formatValue(data.zinc)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Iron</label>
              <p className="text-sm">{formatValue(data.iron)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nickel</label>
              <p className="text-sm">{formatValue(data.nickel)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Lead</label>
              <p className="text-sm">{formatValue(data.lead)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Potassium</label>
              <p className="text-sm">{formatValue(data.potassium)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculated Values */}
      <Card>
        <CardHeader>
          <CardTitle>Calculated Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                <Trans i18nKey="common:fuelQualityData.ccai" />
              </label>
              <p className="text-sm">{formatValue(data.ccai)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Net Specific Energy</label>
              <p className="text-sm">{formatValue(data.net_specific_energy)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gross Specific Energy</label>
              <p className="text-sm">{formatValue(data.gross_specific_energy)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
