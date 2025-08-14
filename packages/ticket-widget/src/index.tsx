import { Suspense } from 'react';

import { hydrateRoot } from 'react-dom/client';

import Widget from './components';
import { IFrame } from './components/iframe';
import styles from './index.css';

const WIDGET_NAME = process.env.WIDGET_NAME;

// initialize the widget
initializeWidget();

function initializeWidget() {
  if (document.readyState !== 'loading') {
    onReady();
  } else {
    document.addEventListener('DOMContentLoaded', onReady);
  }
}

function onReady() {
  try {
    const element = document.createElement('div');
    const accountId = getAccountId();

    const component = (
      <IFrame>
        <Suspense fallback={null}>
          <style suppressHydrationWarning>{styles}</style>
          <Widget accountId={accountId} />
        </Suspense>
      </IFrame>
    );

    hydrateRoot(element, component);

    document.body.appendChild(element);
  } catch (error) {
    console.warn(`Could not initialize Widget`);
    console.warn(error);
  }
}

function getAccountId() {
  const script = getCurrentScript();

  if (!script) {
    throw new Error('Script not found');
  }

  const accountId = script.getAttribute('data-account');

  if (!accountId) {
    throw new Error('Missing data-account-id attribute');
  }

  return accountId;
}

function getCurrentScript() {
  const currentScript = document.currentScript;

  if (!WIDGET_NAME) {
    throw new Error('Missing WIDGET_NAME environment variable');
  }

  if (currentScript?.getAttribute('src')?.includes(WIDGET_NAME)) {
    return currentScript as HTMLScriptElement;
  }

  return Array.from(document.scripts).find((item) => {
    return item.src.includes(WIDGET_NAME);
  });
}
