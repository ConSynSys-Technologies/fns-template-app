import * as React from 'react';
import { PiletApi } from 'piral-core';
import App from './App';

export function setup(app: PiletApi) {
  const value = app.getData('data');

  if (!value.apiUrl) {
    throw new Error('apiUrl is empty');
  }

  app.registerPage('/*', () => <App apiUrl={value.apiUrl} />);
}
