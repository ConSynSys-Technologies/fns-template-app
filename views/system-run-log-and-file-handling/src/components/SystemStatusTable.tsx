import React, { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  Autocomplete,
  Alert,
  Button,
  Box,
  MenuItem,
  DialogActions,
  Typography,
} from "@mui/material";
import Dialog from '../common/Dialog';

interface AppProps {
  apiUrl: string;
  setHasMissingPermissions: (newValue: boolean) => void;
}

interface TableRow {
  [key: number]: string | number;
}

const operationModes = ['BATCH_BASED', 'CONTINUOUS', 'S88_BATCH_BASED'] as const;
type OperationMode = typeof operationModes[number];

const StatusTable = ({ data, allSystemIDsNames }: { data: TableRow[], allSystemIDsNames: Record<string, string> }) => {
  return (
    <ul className="responsive-table">
      <li className="table-header">
        <div className="col col-1">Name</div>
        <div className="col col-1">System ID</div>
        <div className="col col-1">Status</div>
        <div className="col col-1">Timestamp</div>
      </li>
      {data?.map((row, i) => (
        <li className="table-row" key={row[0]}>
          <div className="col col-1">{allSystemIDsNames[row[0]]}</div>
          <div className="col col-1">{row[0]}</div>
          <div className="col col-1">{row[1] === 0 ? "Stopped" : "Started"}</div>
          <div className="col col-1">{row[2]}</div>
        </li>
      ))}
    </ul>
  );
};

export default function MySystemForm({ apiUrl, setHasMissingPermissions }: AppProps) {
  const [systemID, setSystemID] = useState<string>('');
  const [limit, setLimit] = useState<number>(20);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [allSystemIDsNames, setAllSystemIDsNames] = useState<Record<string, string>>({});
  const [operationMode, setOperationMode] = useState<OperationMode>('BATCH_BASED');
  const [showModeForm, setShowModeForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);

  const handleChangeRunningMode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!systemID || isSaving) return;

    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`${apiUrl}/system/${encodeURIComponent(systemID)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationMode }),
        mode: 'cors',
        credentials: 'include',
      });

      if (response.status === 403) {
        setHasMissingPermissions(true);
        return;
      }

      // The endpoint may return an empty success response or a JSON service error.
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.error) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Failed to change running mode. Please try again.');
      }

      setShowModeForm(false);
      setMessage({ severity: 'success', text: `Running mode changed to ${operationMode}.` });
    } catch (e) {
      setMessage({ severity: 'error', text: e instanceof Error ? e.message : 'Failed to change running mode. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getSystemData = async ({ systemID, limit }: { systemID: string, limit: number }) => {
    if (!limit) {
      return;
    }

    try {
      const url = systemID === "" || systemID === "All Systems"
        ? `${apiUrl}/system/all/limit/${limit}`
        : `${apiUrl}/system/${systemID}/limit/${limit}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        credentials: 'include',
      });

      if (response.status === 403) {
        setHasMissingPermissions(true);
        return;
      }

      const data = await response.json();
      setTableData(data);
    } catch (e) {
      console.error('Failed to fetch files:', e);
    }
  };

  useEffect(() => {
    // Call getSystemData once when the component mounts
    getSystemData({ systemID, limit });

    // Set up interval to call getSystemData every two seconds
    const intervalId = setInterval(() => {
      getSystemData({ systemID, limit });
    }, 2000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [systemID, limit]);

  const fetchAllSystemIDs = async () => {
    try {
      const url = `${window.location.protocol}//${window.location.hostname}/api/structure/v1/systems`
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        credentials: 'include',
      });

      const data = await response.json();
      const namesIDs: Record<string, string> = {};

      data.forEach((item: { id: string; name: string }) => {
        namesIDs[item.id] = item.name;
      })

      setAllSystemIDsNames(namesIDs);
    } catch (e) {
      console.error('Failed to fetch files:', e);
    }
  }

  useEffect(() => {
    fetchAllSystemIDs();
  }, []);

  return (
    <>
      {message && !showModeForm && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}
      <Autocomplete
        options={['', ...Object.keys(allSystemIDsNames)]}
        getOptionLabel={(id) => id ? `${allSystemIDsNames[id]} - ${id}` : 'All systems'}
        value={systemID}
        disabled={isSaving}
        onChange={(_, newValue) => { setSystemID(newValue || ''); setMessage(null); }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select System"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  {params.InputProps.endAdornment}
                </InputAdornment>
              ),
            }}
          />
        )}
      />
      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        disabled={!systemID || isSaving}
        onClick={() => { setMessage(null); setShowModeForm(true); }}
      >
        Change running mode
      </Button>
      {showModeForm && (
        <Dialog onClose={() => { if (!isSaving) setShowModeForm(false); }}>
          <Box component="form" onSubmit={handleChangeRunningMode}>
            <Typography variant="h6" component="h2">Change running mode</Typography>
            {message && <Alert severity={message.severity} sx={{ mt: 2 }}>{message.text}</Alert>}
            <Typography sx={{ mt: 2 }}>
              {allSystemIDsNames[systemID]} ({systemID})
            </Typography>
            <TextField
              select
              label="Operation mode"
              value={operationMode}
              onChange={(event) => setOperationMode(event.target.value as OperationMode)}
              fullWidth
              margin="normal"
              disabled={isSaving}
              SelectProps={{ MenuProps: { disablePortal: true } }}
            >
              {operationModes.map(mode => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}
            </TextField>
            <DialogActions>
              <Button disabled={isSaving} onClick={() => setShowModeForm(false)}>Cancel</Button>
              <Button variant="contained" type="submit" disabled={!systemID || isSaving}>
                {isSaving ? 'Saving…' : 'Save mode'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}

      <div style={{ marginBottom: '10px' }} />
      <TextField
        variant="outlined"
        InputProps={{
          endAdornment: <InputAdornment position="end">Limit</InputAdornment>,
        }}
        onChange={(e) => setLimit(parseInt(e.target.value))}
        value={limit}
      />
      <div style={{ marginBottom: '20px' }} />
      {tableData !== null && <StatusTable data={tableData} allSystemIDsNames={allSystemIDsNames} />}
    </>
  );
}
