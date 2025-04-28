import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

interface AppProps {
  apiUrl: string;
}

interface FileItem {
  key: string;
  [key: string]: any;
}

type FileObject = {
  name: string;
  size: number;
};

type FileListResponse = {
  objects: FileObject[];
  continuationToken: string;
};

export default function FileHandling({ apiUrl }: AppProps){
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch file list
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${apiUrl}/storage/list`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        credentials: 'include',
      });
      const data: FileListResponse = await resp.json();
      if (data.objects && Array.isArray(data.objects)) {
        setFiles(data.objects.map((obj: FileObject) => ({ key: obj.name, ...obj })));
      } else {
        setFiles([]);
      }
    } catch (e) {
      setMessage("Failed to fetch files.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [apiUrl]);

  // Handle file selection for batch delete
  const handleToggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Download file
  const handleDownload = async (key: string) => {
    setMessage(null);
    try {
      const resp = await fetch(`${apiUrl}/storage/download/${encodeURIComponent(key)}`, {
        method: "GET",
        mode: 'cors',
        credentials: 'include',
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = key;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.URL.revokeObjectURL(url);
        setMessage("Download started.");
      } else {
        setMessage("Failed to download file.");
      }
    } catch {
      setMessage("Failed to download file.");
    }
  };

  // Delete single file
  const handleDelete = async (key: string) => {
    setMessage(null);
    try {
      const resp = await fetch(`${apiUrl}/storage/delete/${encodeURIComponent(key)}`, {
        method: "DELETE",
        mode: 'cors',
        credentials: 'include',
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage("File deleted.");
        fetchFiles();
      } else {
        setMessage(data.error || "Failed to delete file.");
      }
    } catch {
      setMessage("Failed to delete file.");
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    setMessage(null);
    try {
      const resp = await fetch(`${apiUrl}/storage/batchDelete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ names: selected }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setMessage("Files deleted.");
        setSelected([]);
        fetchFiles();
      } else {
        setMessage(data.error || "Failed to batch delete.");
      }
    } catch {
      setMessage("Failed to batch delete.");
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", new Blob([await uploadFile.arrayBuffer()], { type: uploadFile.type }), encodeURIComponent(uploadFile.name));

      const resp = await fetch(`${apiUrl}/storage`, {
        method: "PUT",
        mode: 'cors',
        credentials: 'include',
        body: formData,
      });
      const data = await resp.json();
      if (resp.ok) {
        var message = data.status;
        if (data.error) {
          message += ` ${data.error}`;
        }

        setMessage(message);
        setUploadFile(null);
        fetchFiles();
      }
    } catch {
      setMessage("Failed to upload file.");
    }
    setUploading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        File Handling
      </Typography>
      {message && (
        <Typography color="error" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Button
          variant="contained"
          component="label"
          disabled={uploading}
        >
          Select File
          <input
            type="file"
            hidden
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />
        </Button>
        <Box sx={{ mx: 2 }}>
          {uploadFile && <span>{uploadFile.name}</span>}
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!uploadFile || uploading}
        >
          {uploading ? <CircularProgress size={20} /> : "Upload"}
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleBatchDelete}
          disabled={selected.length === 0}
        >
          Delete Selected
        </Button>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          onClick={fetchFiles}
        >
          Refresh
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <List dense>
          {files.length === 0 && (
            <Typography>No files found.</Typography>
          )}
          {files.map((file) => (
            <ListItem
              key={file.key}
              secondaryAction={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleDownload(file.key)}
                  >
                  Download
                  </Button>
                  <Box sx={{ mx: 2 }} />
                  <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleDelete(file.key)}
                  >
                  Delete
                  </Button>
                </Box>
              }
            >
              <Checkbox
                checked={selected.includes(file.key)}
                onChange={() => handleToggle(file.key)}
              />
              <ListItemText primary={file.key} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
