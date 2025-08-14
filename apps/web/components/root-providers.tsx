'use client';

import { useMemo, useEffect } from 'react';

import dynamic from 'next/dynamic';

import { ThemeProvider } from 'next-themes';

import { CaptchaProvider } from '@kit/auth/captcha/client';
import { I18nProvider } from '@kit/i18n/provider';
import { MonitoringProvider } from '@kit/monitoring/components';
import { AppEventsProvider } from '@kit/shared/events';
import { If } from '@kit/ui/if';
import { VersionUpdater } from '@kit/ui/version-updater';

import { AnalyticsProvider } from '~/components/analytics-provider';
import { AuthProvider } from '~/components/auth-provider';
import appConfig from '~/config/app.config';
import authConfig from '~/config/auth.config';
import featuresFlagConfig from '~/config/feature-flags.config';
import { i18nResolver } from '~/lib/i18n/i18n.resolver';
import { getI18nSettings } from '~/lib/i18n/i18n.settings';

import { ReactQueryProvider } from './react-query-provider';

const captchaSiteKey = authConfig.captchaTokenSiteKey;

const CaptchaTokenSetter = dynamic(async () => {
  if (!captchaSiteKey) {
    return Promise.resolve(() => null);
  }

  const { CaptchaTokenSetter } = await import('@kit/auth/captcha/client');

  return {
    default: CaptchaTokenSetter,
  };
});

// Color scheme configuration
const colorSchemes = [
  { value: 'default', color: 'hsl(220.9 39.3% 11%)' },
  { value: 'blue', color: 'hsl(221.2 83.2% 53.3%)' },
  { value: 'green', color: 'hsl(142.1 76.2% 36.3%)' },
  { value: 'purple', color: 'hsl(262.1 83.3% 57.8%)' },
  { value: 'orange', color: 'hsl(24.6 95% 53.1%)' },
  { value: 'red', color: 'hsl(0 84.2% 60.2%)' },
];

// Global color scheme manager
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

type RootProvidersProps = React.PropsWithChildren<{
  // The language to use for the app (optional)
  lang?: string;
  // The theme (light or dark or system) (optional)
  theme?: string;
  // The CSP nonce to pass to scripts (optional)
  nonce?: string;
}>;

export function RootProviders({
  lang,
  theme = appConfig.theme,
  nonce,
  children,
}: RootProvidersProps) {
  const i18nSettings = useMemo(() => getI18nSettings(lang), [lang]);

  // Apply font classes and color scheme to body element on client side
  useEffect(() => {
    const body = document.body;
    if (body) {
      body.classList.add('inter_cca1aaa4-module__HtUGRW__variable', 'quicksand_cca1aaa4-module__HtUGRW__variable');
    }

    // Apply saved color scheme on every page load/navigation
    const savedColorScheme = localStorage.getItem('color-scheme') || 'default';
    applyColorScheme(savedColorScheme);
  }, []);

  return (
    <MonitoringProvider>
      <AppEventsProvider>
        <AnalyticsProvider>
          <ReactQueryProvider>
            <I18nProvider settings={i18nSettings} resolver={i18nResolver}>
              <CaptchaProvider>
                <CaptchaTokenSetter siteKey={captchaSiteKey} nonce={nonce} />

                <AuthProvider>
                  <ThemeProvider
                    attribute="class"
                    enableSystem
                    disableTransitionOnChange
                    defaultTheme={theme}
                    enableColorScheme={false}
                    nonce={nonce}
                  >
                    {children}
                  </ThemeProvider>
                </AuthProvider>
              </CaptchaProvider>

              <If condition={featuresFlagConfig.enableVersionUpdater}>
                <VersionUpdater />
              </If>
            </I18nProvider>
          </ReactQueryProvider>
        </AnalyticsProvider>
      </AppEventsProvider>
    </MonitoringProvider>
  );
}
