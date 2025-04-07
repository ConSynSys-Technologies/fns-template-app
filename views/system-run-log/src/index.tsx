import * as React from 'react';
import { PiletApi } from '@procaaso/pc-piral-instance';
import App from './App';
import styles from './styles/style.scss';

export function setup(app: PiletApi) {
  const value = app.getData('data');
  app.registerPage('/*', () => <App apiUrl={value?.apiUrl} styles={[styles.toString()]} />);
}
