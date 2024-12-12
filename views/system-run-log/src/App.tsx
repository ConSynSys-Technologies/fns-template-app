import * as React from 'react';
import MySystemForm from './components/SystemStatusTable'

interface AppProps {
  apiUrl: string;
}

const App: React.FC<AppProps> = ({ apiUrl }) => {
  return (
    <div className="dashboard-container">
      <h1>System run log</h1>
      <MySystemForm apiUrl={apiUrl} />
    </div>
  );
};

export default App
