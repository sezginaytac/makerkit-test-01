'use client';

import { z } from 'zod';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';
import { SidebarNavigation } from '@kit/ui/shadcn-sidebar';
import { useTeamAccountWorkspace } from '@kit/team-accounts/hooks/use-team-account-workspace';

export function TeamAccountLayoutSidebarNavigation({
  config,
}: React.PropsWithChildren<{
  config: z.infer<typeof NavigationConfigSchema>;
}>) {
  const { account } = useTeamAccountWorkspace();
  
  // Filter routes based on user role
  const filteredConfig = {
    ...config,
    routes: config.routes.map((route) => {
      if ('children' in route) {
        // For route groups, filter children
        const filteredChildren = route.children.filter((child: any) => {
          if (child.requiredRole) {
            return account.role === child.requiredRole;
          }
          return true;
        });
        
        return {
          ...route,
          children: filteredChildren,
        };
      }
      
      if ('divider' in route) {
        return route;
      }
      
      // For individual routes, check required role
      const routeAny = route as any;
      if (routeAny.requiredRole) {
        return account.role === routeAny.requiredRole ? route : null;
      }
      
      return route;
    }).filter(Boolean) as any,
  };

  return <SidebarNavigation config={filteredConfig} />;
}
