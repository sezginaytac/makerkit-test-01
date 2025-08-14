'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@kit/ui/dropdown-menu';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { Trans } from '@kit/ui/trans';

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const colorSchemes = [
  { value: 'default', label: 'Default', color: 'hsl(220.9 39.3% 11%)' },
  { value: 'blue', label: 'Blue', color: 'hsl(221.2 83.2% 53.3%)' },
  { value: 'green', label: 'Green', color: 'hsl(142.1 76.2% 36.3%)' },
  { value: 'purple', label: 'Purple', color: 'hsl(262.1 83.3% 57.8%)' },
  { value: 'orange', label: 'Orange', color: 'hsl(24.6 95% 53.1%)' },
  { value: 'red', label: 'Red', color: 'hsl(0 84.2% 60.2%)' },
];

interface SubMenuThemeToggleProps {
  isMobile?: boolean;
}

function SubMenuThemeToggle({ isMobile = false }: SubMenuThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [colorScheme, setColorScheme] = useState('default');

  const applyColorScheme = (scheme: string) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Reset to default first
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-foreground');
    root.style.removeProperty('--ring');
    
    if (scheme !== 'default') {
      const schemeConfig = colorSchemes.find(s => s.value === scheme);
      if (schemeConfig) {
        root.style.setProperty('--primary', schemeConfig.color);
        root.style.setProperty('--primary-foreground', 'hsl(210 20% 98%)');
        root.style.setProperty('--ring', schemeConfig.color);
      }
    }
  };

  const changeColorScheme = (scheme: string) => {
    if (typeof window === 'undefined') return;
    
    setColorScheme(scheme);
    localStorage.setItem('color-scheme', scheme);
    applyColorScheme(scheme);
  };

  // Initialize on client side only
  useEffect(() => {
    setMounted(true);
    
    // Load saved color scheme
    const savedColorScheme = localStorage.getItem('color-scheme') || 'default';
    setColorScheme(savedColorScheme);
  }, []);

  // Listen for storage changes to sync color scheme across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'color-scheme') {
        const newScheme = e.newValue || 'default';
        setColorScheme(newScheme);
        applyColorScheme(newScheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Mobile version - simpler layout without nested submenus
  if (isMobile) {
    return (
      <>
        {/* Theme Mode Options */}
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`flex items-center gap-2 ${
              theme === themeOption.value ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <themeOption.icon className="h-4 w-4" />
            <Trans i18nKey={`common:${themeOption.value}`} defaults={themeOption.label} />
            {theme === themeOption.value && (
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            )}
          </DropdownMenuItem>
        ))}

        {/* Color Scheme Options */}
        {colorSchemes.map((scheme) => (
          <DropdownMenuItem
            key={scheme.value}
            onClick={() => changeColorScheme(scheme.value)}
            className={`flex items-center gap-2 ${
              colorScheme === scheme.value ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                colorScheme === scheme.value ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: scheme.color }}
            />
            <Trans 
              i18nKey={`common:colorScheme.${scheme.value}`} 
              defaults={scheme.label} 
            />
            {colorScheme === scheme.value && (
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </>
    );
  }

  // Desktop version - with nested submenus
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Palette className="h-5" />
        <span>
          <Trans i18nKey="common:theme" defaults="Theme" />
        </span>
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent>
        {/* Theme Mode Options */}
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 ${
            theme === 'light' ? 'bg-accent text-accent-foreground' : ''
          }`}
        >
          <Sun className="h-4 w-4" />
          <Trans i18nKey="common:light" defaults="Light" />
          {theme === 'light' && (
            <div className="ml-auto">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 ${
            theme === 'dark' ? 'bg-accent text-accent-foreground' : ''
          }`}
        >
          <Moon className="h-4 w-4" />
          <Trans i18nKey="common:dark" defaults="Dark" />
          {theme === 'dark' && (
            <div className="ml-auto">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`flex items-center gap-2 ${
            theme === 'system' ? 'bg-accent text-accent-foreground' : ''
          }`}
        >
          <Monitor className="h-4 w-4" />
          <Trans i18nKey="common:system" defaults="System" />
          {theme === 'system' && (
            <div className="ml-auto">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
          )}
        </DropdownMenuItem>

        {/* Color Scheme Options */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="h-4 w-4" />
            <span>
              <Trans i18nKey="common:colors" defaults="Colors" />
            </span>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            {colorSchemes.map((scheme) => (
              <DropdownMenuItem
                key={scheme.value}
                onClick={() => changeColorScheme(scheme.value)}
                className={`flex items-center gap-2 ${
                  colorScheme === scheme.value ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    colorScheme === scheme.value ? 'border-primary' : 'border-border'
                  }`}
                  style={{ backgroundColor: scheme.color }}
                />
                <Trans 
                  i18nKey={`common:colorScheme.${scheme.value}`} 
                  defaults={scheme.label} 
                />
                {colorScheme === scheme.value && (
                  <div className="ml-auto">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export { SubMenuThemeToggle };
export default SubMenuThemeToggle;
