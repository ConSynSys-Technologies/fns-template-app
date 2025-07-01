import React, { useState } from 'react';
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
  const [showFileHandling, setShowFileHandling] = useState(false);
  const [hasMissingPermissions, setHasMissingPermissions] = useState(false);

  if (hasMissingPermissions) {
    return (
      <div>
        You are missing permissions to see this!
      </div>
    );
  }

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
        <FileHandling
          apiUrl={apiUrl}
          setHasMissingPermissions={setHasMissingPermissions}
        />
      ) : (
        <>
          <h1>System run log</h1>
          <MySystemForm
            apiUrl={apiUrl}
            setHasMissingPermissions={setHasMissingPermissions}
          />
        </>
      )}
    </div>
  );
};

export default withShadowDOM(App)
