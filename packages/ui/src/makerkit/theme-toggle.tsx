'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';

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

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [colorScheme, setColorScheme] = useState('default');

  useEffect(() => {
    setMounted(true);
    const savedColorScheme = localStorage.getItem('color-scheme') || 'default';
    setColorScheme(savedColorScheme);
    applyColorScheme(savedColorScheme);
  }, []);

  const applyColorScheme = (scheme: string) => {
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

  const handleColorSchemeChange = (scheme: string) => {
    setColorScheme(scheme);
    localStorage.setItem('color-scheme', scheme);
    applyColorScheme(scheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {themes.find(t => t.value === theme)?.icon && (
              <themes.find(t => t.value === theme)!.icon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {themes.map((t) => (
            <DropdownMenuItem
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="flex items-center gap-2"
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Scheme Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4" />
            <span className="sr-only">Toggle color scheme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {colorSchemes.map((scheme) => (
            <DropdownMenuItem
              key={scheme.value}
              onClick={() => handleColorSchemeChange(scheme.value)}
              className="flex items-center gap-2"
            >
              <div
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: scheme.color }}
              />
              {scheme.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
