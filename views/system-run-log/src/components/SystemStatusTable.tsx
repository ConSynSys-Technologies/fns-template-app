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

interface NamesIDs {
  "All systems": string;
  [key: string]: string;
}

const MyTable = ({ data, allSystemIDsNames }: { data: TableRow[], allSystemIDsNames: Record<string, string> }) => {
  return (
    <ul className="responsive-table">
      <li className="table-header">
        <div className="col col-1">Name</div>
        <div className="col col-1">System ID</div>
        <div className="col col-1">Status</div>
        <div className="col col-1">Timestamp</div>
      </li>
      {data.map((row, i) => (
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

export default function MySystemForm({ apiUrl }: Readonly<AppProps>) {
  const [systemID, setSystemID] = useState<string>('');
  const [systemName, setSystemName] = useState<string>('');
  const [limit, setLimit] = useState<number>(20);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [allSystemIDsNames, setAllSystemIDsNames] = useState<Record<string, string>>({});

  const handleChange = (nameWithID: string | null) => {
    if (!nameWithID) return null;
    const [name, id] = nameWithID.split(' - ');
    setSystemName(name);
    setSystemID(id);
  };

  const getSystemData = async ({ systemID, limit }: { systemID: string, limit: number }) => {
    if (!limit) {
      return;
    }

    const url = systemID === "" || systemID === "All Systems"
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

      const url = `${window.location.protocol}//${window.location.hostname}/api/structure/v1/systems`
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        credentials: 'include',
      });

      const data = await response.json();
      const namesIDs: NamesIDs = { "All systems": "All Systems" };

      data.forEach((item: { id: string; name: string }) => {
        namesIDs[item.id] = item.name;
      })

      setAllSystemIDsNames(namesIDs);
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
      {tableData !== null && <MyTable data={tableData} allSystemIDsNames={allSystemIDsNames} />}
    </>
  );
}
