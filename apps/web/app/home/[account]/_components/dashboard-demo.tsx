'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Ship, Database, TrendingUp, BarChart3, Calculator, Fuel } from 'lucide-react';
import { Trans } from '@kit/ui/trans';

interface DashboardDemoProps {
  account: string;
}

export function DashboardDemo({ account }: DashboardDemoProps) {
  const features = [
    {
      title: <Trans i18nKey="common:fuelManager.shipInventory" defaults="Ship Inventory" />,
      description: <Trans i18nKey="common:fuelManager.shipInventoryDescription" defaults="Manage ship information and fuel inventory data" />,
      icon: <Ship className="h-8 w-8" />,
      href: `/home/${account}/ships`,
      color: 'bg-blue-500',
    },
    {
      title: <Trans i18nKey="common:fuelManager.fuelInventory" defaults="Fuel Inventory" />,
      description: <Trans i18nKey="common:fuelManager.fuelInventoryDescription" defaults="Manage fuel inventory and consumption data for ships" />,
      icon: <Fuel className="h-8 w-8" />,
      href: `/home/${account}/fuel-inventory`,
      color: 'bg-green-500',
    },
    {
      title: <Trans i18nKey="common:fuelQualityData.title" defaults="Fuel Quality Data" />,
      description: <Trans i18nKey="common:fuelQualityData.description" defaults="Upload and manage fuel quality data from Excel files" />,
      icon: <Database className="h-8 w-8" />,
      href: `/home/${account}/fuel-quality-data`,
      color: 'bg-purple-500',
    },
    {
      title: <Trans i18nKey="common:fuelManager.pricePrediction" defaults="Price Prediction" />,
      description: <Trans i18nKey="common:fuelManager.pricePredictionDescription" defaults="Upload and process price prediction models" />,
      icon: <TrendingUp className="h-8 w-8" />,
      href: `/home/${account}/price-prediction`,
      color: 'bg-orange-500',
    },
    {
      title: <Trans i18nKey="common:fuelManager.supplyDemand" defaults="Supply & Demand" />,
      description: <Trans i18nKey="common:fuelManager.supplyDemandDescription" defaults="Monitor supply and demand market data" />,
      icon: <BarChart3 className="h-8 w-8" />,
      href: `/home/${account}/supply-demand`,
      color: 'bg-red-500',
    },
    {
      title: <Trans i18nKey="common:fuelManager.procurementDecisions" defaults="Procurement Decisions" />,
      description: <Trans i18nKey="common:fuelManager.procurementDecisionsDescription" defaults="Get AI-powered procurement recommendations" />,
      icon: <Calculator className="h-8 w-8" />,
      href: `/home/${account}/procurement`,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex items-center space-x-2">
          <Fuel className="h-12 w-12 text-primary" />
                      <h1 className="text-4xl font-bold tracking-tight">
              <Trans i18nKey="common:fuelManager.dashboard" defaults="Fuel Manager Dashboard" />
            </h1>
        </div>
                  <p className="max-w-[600px] text-lg text-muted-foreground">
            <Trans 
              i18nKey="common:fuelManager.welcomeMessage" 
              defaults="Welcome to the comprehensive fuel management system. Monitor inventory, analyze quality, predict prices, and make informed procurement decisions."
            />
          </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                  {feature.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {feature.description}
              </CardDescription>
              <Button asChild className="w-full">
                <a href={feature.href}>
                  <Trans i18nKey="common:fuelManager.open" defaults="Open" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">
          <Trans i18nKey="common:fuelManager.quickOverview" defaults="Quick Overview" />
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                    <Trans i18nKey="common:fuelManager.totalShips" defaults="Total Ships" />
                  </CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                    <Trans i18nKey="common:fuelManager.registeredVessels" defaults="Registered vessels" />
                  </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                    <Trans i18nKey="common:fuelManager.fuelQualityFiles" defaults="Fuel Quality Files" />
                  </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                    <Trans i18nKey="common:fuelManager.uploadedFiles" defaults="Uploaded files" />
                  </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                    <Trans i18nKey="common:fuelManager.pricePredictions" defaults="Price Predictions" />
                  </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                    <Trans i18nKey="common:fuelManager.activeModels" defaults="Active models" />
                  </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                    <Trans i18nKey="common:fuelManager.procurementDecisions" defaults="Procurement Decisions" />
                  </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                    <Trans i18nKey="common:fuelManager.thisMonth" defaults="This month" />
                  </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
