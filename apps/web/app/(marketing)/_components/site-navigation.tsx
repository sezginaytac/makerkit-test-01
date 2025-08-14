'use client';

import Link from 'next/link';

import { Menu } from 'lucide-react';
import dynamic from 'next/dynamic';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuList } from '@kit/ui/navigation-menu';
import { Trans } from '@kit/ui/trans';

import { SiteNavigationItem } from './site-navigation-item';

// Dynamic imports for theme and language components
const SubMenuThemeToggle = dynamic(() => import('@kit/ui/sub-menu-theme-toggle'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 px-3 py-3 text-sm">
      <div className="h-4 w-4 animate-pulse rounded bg-muted" />
      <span className="text-muted-foreground">Theme</span>
    </div>
  ),
});

const SubMenuLanguageToggle = dynamic(() => import('@kit/ui/language-toggle'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 px-3 py-3 text-sm">
      <div className="h-4 w-4 animate-pulse rounded bg-muted" />
      <span className="text-muted-foreground">Language</span>
    </div>
  ),
});

const links = {
  Blog: {
    label: 'marketing:blog',
    path: '/blog',
  },
  Docs: {
    label: 'marketing:documentation',
    path: '/docs',
  },
  Pricing: {
    label: 'marketing:pricing',
    path: '/pricing',
  },
  FAQ: {
    label: 'marketing:faq',
    path: '/faq',
  },
  Contact: {
    label: 'marketing:contact',
    path: '/contact',
  },
};

export function SiteNavigation() {
  const NavItems = Object.values(links).map((item) => {
    return (
      <SiteNavigationItem key={item.path} path={item.path}>
        <Trans i18nKey={item.label} />
      </SiteNavigationItem>
    );
  });

  return (
    <>
      <div className={'hidden items-center justify-center md:flex'}>
        <NavigationMenu>
          <NavigationMenuList className={'gap-x-2.5'}>
            {NavItems}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className={'flex justify-start sm:items-center md:hidden'}>
        <MobileDropdown />
      </div>
    </>
  );
}

function MobileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={'Open Menu'}>
        <Menu className={'h-8 w-8'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className={'w-full max-h-[80vh] overflow-y-auto'}>
        {Object.values(links).map((item) => {
          const className = 'flex w-full h-full items-center';

          return (
            <DropdownMenuItem key={item.path} asChild>
              <Link className={className} href={item.path}>
                <Trans i18nKey={item.label} />
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        {/* Theme and Language Settings */}
        <DropdownMenuItem className="text-xs font-medium text-muted-foreground cursor-default">
          <Trans i18nKey="common:theme" defaults="Theme" />
        </DropdownMenuItem>
        <SubMenuThemeToggle isMobile={true} />
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-xs font-medium text-muted-foreground cursor-default">
          <Trans i18nKey="common:language" defaults="Language" />
        </DropdownMenuItem>
        <SubMenuLanguageToggle isMobile={true} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
