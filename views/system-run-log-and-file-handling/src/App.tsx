import * as React from 'react';
import {
  Button,
} from '@mui/material';
import MySystemForm from './components/SystemStatusTable'
import FileHandling from './components/FileHandling';
import withShadowDOM from "./shadow/withShadowDOM";

interface AppProps {
  apiUrl: string;
}

const App: React.FC<AppProps> = ({ apiUrl }) => {
  const [showFileHandling, setShowFileHandling] = React.useState(false);

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: 16 }}>
        {!showFileHandling ? (
          <Button variant="contained"
          component="label" onClick={() => setShowFileHandling(true)}>
            Show File Handling
          </Button>
        ) : (
          <Button variant="contained"
          component="label" onClick={() => setShowFileHandling(false)}>
            Back to System Run Log
          </Button>
        )}
      </div>
      {showFileHandling ? (
        <FileHandling apiUrl={apiUrl} />
      ) : (
        <>
          <h1>System run log</h1>
          <MySystemForm apiUrl={apiUrl} />
        </>
      )}
    </div>
  );
};

export default withShadowDOM(App)