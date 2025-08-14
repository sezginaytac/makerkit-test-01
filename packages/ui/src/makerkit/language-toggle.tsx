'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';

import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../shadcn/dropdown-menu';
import { Trans } from './trans';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
];

interface SubMenuLanguageToggleProps {
  isMobile?: boolean;
}

export function SubMenuLanguageToggle({ isMobile = false }: SubMenuLanguageToggleProps) {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Initialize on client side only
  useEffect(() => {
    setMounted(true);
  }, []);

  const MenuItems = useMemo(
    () =>
      LANGUAGES.map((lang) => {
        const isSelected = i18n.language === lang.code;

        return (
          <DropdownMenuItem
            className={cn('flex cursor-pointer items-center space-x-2', {
              'bg-muted': isSelected,
            })}
            key={lang.code}
            onClick={() => {
              i18n.changeLanguage(lang.code);
              // Set cookie for language preference
              document.cookie = `lang=${lang.code}; path=/; max-age=31536000`;
              // Reload page to apply language change
              window.location.reload();
            }}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        );
      }),
    [i18n],
  );

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) ?? LANGUAGES[0];

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Mobile version - simpler layout without nested submenus
  if (isMobile) {
    return (
      <>
        {MenuItems}
      </>
    );
  }

  // Desktop version - with nested submenus
  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          className={
            'hidden w-full items-center justify-between gap-x-3 lg:flex'
          }
        >
          <span className={'flex space-x-2'}>
            <Languages className="h-4 w-4" />
            <span>
              <Trans i18nKey={'common:language'} defaults="Language" />
            </span>
          </span>
          <span className="text-sm text-muted-foreground">
            {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
          </span>
        </DropdownMenuSubTrigger>

        <DropdownMenuSubContent>{MenuItems}</DropdownMenuSubContent>
      </DropdownMenuSub>

      <div className={'lg:hidden'}>
        <DropdownMenuLabel>
          <Trans i18nKey={'common:language'} defaults="Language" />
        </DropdownMenuLabel>

        {MenuItems}
      </div>
    </>
  );
}

// Add default export for dynamic imports
export default SubMenuLanguageToggle;
