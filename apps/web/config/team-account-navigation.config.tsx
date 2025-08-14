import {
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Users,
  Ship,
  Database,
  TrendingUp,
  BarChart3,
  Calculator,
} from 'lucide-react';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const getRoutes = (account: string) => [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'common:routes.dashboard',
        path: pathsConfig.app.accountHome.replace('[account]', account),
        Icon: <LayoutDashboard className={iconClasses} />,
        end: true,
      },
      {
        label: 'common:supportTickets',
        collapsible: false,
        path: `/home/${account}/tickets`,
        Icon: <MessageCircle className={iconClasses} />,
      },
    ],
  },

  {
    label: 'common:fuelManagerLabel',
    children: [
      {
        label: 'common:fuelManager.shipInventory',
        path: `/home/${account}/ships`,
        Icon: <Ship className={iconClasses} />,
        requiredRole: 'owner',
      },
      {
        label: 'common:fuelManager.fuelQuality',
        path: `/home/${account}/fuel-quality`,
        Icon: <Database className={iconClasses} />,
      },
      {
        label: 'common:fuelManager.pricePrediction',
        path: `/home/${account}/price-prediction`,
        Icon: <TrendingUp className={iconClasses} />,
      },
      {
        label: 'common:fuelManager.supplyDemand',
        path: `/home/${account}/supply-demand`,
        Icon: <BarChart3 className={iconClasses} />,
      },
      {
        label: 'common:fuelManager.procurementDecisions',
        path: `/home/${account}/procurement`,
        Icon: <Calculator className={iconClasses} />,
      },
    ],
  },
  {
    label: 'common:settingsTabLabel',
    collapsible: false,
    children: [
      {
        label: 'common:routes.settings',
        path: createPath(pathsConfig.app.accountSettings, account),
        Icon: <Settings className={iconClasses} />,
      },
      {
        label: 'common:routes.members',
        path: createPath(pathsConfig.app.accountMembers, account),
        Icon: <Users className={iconClasses} />,
      },
      featureFlagsConfig.enableTeamAccountBilling
        ? {
            label: 'common:routes.billing',
            path: createPath(pathsConfig.app.accountBilling, account),
            Icon: <CreditCard className={iconClasses} />,
          }
        : undefined,
    ].filter(Boolean),
  },
];

export function getTeamAccountSidebarConfig(account: string) {
  return NavigationConfigSchema.parse({
    routes: getRoutes(account),
    style: process.env.NEXT_PUBLIC_TEAM_NAVIGATION_STYLE,
    sidebarCollapsed: process.env.NEXT_PUBLIC_TEAM_SIDEBAR_COLLAPSED,
    sidebarCollapsedStyle: process.env.NEXT_PUBLIC_SIDEBAR_COLLAPSIBLE_STYLE,
  });
}

function createPath(path: string, account: string) {
  return path.replace('[account]', account);
}
