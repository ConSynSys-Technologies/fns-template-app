import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  Autocomplete,
} from "@mui/material";

interface AppProps {
  apiUrl: string;
}

interface TableRow {
  [key: number]: string | number;
}

export default function MySystemForm({ apiUrl }: AppProps) {
  const [systemID, setSystemID] = useState('');
  const [systemName, setSystemName] = useState('');
  const [limit, setLimit] = useState(20);
  const [tableData, setTableData] = useState([]);
  const [allSystemIDsNames, setSystemNameID] = useState<Record<string, string>>({});

  const handleChange = (nameWithID: string | null) => {
    if (!nameWithID) return null;
    const [name, id] = nameWithID.split(' - ');
    setSystemName(name);
    setSystemID(id);
  };

  const getSystemData = async ({ systemID, limit }: { systemID: string, limit: number }) => {
    if (limit == 0) {
      return;
    }

    if (systemID == "All Systems") {
      systemID = "";
    }

    const url = systemID === ""
      ? `${apiUrl}/system/all/limit/${limit}`
      : `${apiUrl}/system/${systemID}/limit/${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      mode: 'cors',
      credentials: 'include',
    });

    const data = await response.json();
    setTableData(data);
  };

  const MyTable = ({ data }: { data: TableRow[] }) => {
    return (
      <ul className="responsive-table">
        <li className="table-header">
          <div className="col col-1">Name</div>
          <div className="col col-1">System ID</div>
          <div className="col col-1">Status</div>
          <div className="col col-1">Timestamp</div>
        </li>
        {data.map((row, i) => (
          <li className="table-row" >
            <div className="col col-1">{allSystemIDsNames[row[0]]}</div>
            <div className="col col-1">{row[0]}</div>
            <div className="col col-1">{row[1] === 0 ? "Stopped" : "Started"}</div>
            <div className="col col-1">{row[2]}</div>
          </li>
        ))}
      </ul>
    );
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

  useEffect(() => {
    const fetchAllSystemIDs = async () => {

      var url = `${window.location.protocol}//${window.location.hostname}/api/structure/v1/systems`
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        credentials: 'include',
      });

      const data = await response.json();
      var namesIDs = { "All systems": "All Systems" };

      for (var i = 0; i < data.length; i++) {
        // @ts-ignore
        namesIDs[data[i].id] = data[i].name;
      }

      setSystemNameID(namesIDs);
    }

    fetchAllSystemIDs();
  }, []);

  return (
    <>
      <Autocomplete
        options={Object.keys(allSystemIDsNames).map((key) => allSystemIDsNames[key] + " - " + key)}
        value={systemName + " - " + systemID}
        defaultValue={"All Systems"}
        onChange={(_, newValue) => { handleChange(newValue) }}
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
      {tableData !== null && <MyTable data={tableData} />}
    </>
  );
}
