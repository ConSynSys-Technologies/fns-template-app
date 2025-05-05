import * as React from 'react';
import { PiletApi } from '@procaaso/pc-piral-instance';
import App from './App';
import styles from './styles/style.scss';

export function setup(app: PiletApi) {
  const value = app.getData('data');

  if (!value?.apiUrl) {
    throw new Error('apiUrl is empty');
  }

  app.registerPage('/*', () => <App apiUrl={value?.apiUrl} styles={[styles.toString()]} />);


  // var url = "http://localhost:7474";
  // app.registerPage('/*', () => <App apiUrl={url} styles={[styles.toString()]} />);
}
