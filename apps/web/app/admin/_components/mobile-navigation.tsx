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

import { Trans } from '@kit/ui/trans';

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

export function AdminMobileNavigation() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className={'h-8 w-8'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className={'max-h-[80vh] overflow-y-auto'}>
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

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Link href={'/admin'}>Home</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Link href={'/admin/accounts'}>Accounts</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
