import React, { useEffect, useState } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { decodeBase64, multipartFileBody, proxyResult } from "../shellApi";

interface AppProps {
  apiUrl: string;
  setHasMissingPermissions: (newValue: boolean) => void;
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

export default function FileHandling({ apiUrl, setHasMissingPermissions }: AppProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch file list
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await proxyResult(`${apiUrl}/storage/list`);

      if (response.status === 403) {
        setHasMissingPermissions(true);
        return;
      }
      if (!response.ok) throw new Error(response.error || "Failed to fetch files.");

      const data = response.data as FileListResponse;
      if (data.objects && Array.isArray(data.objects)) {
        setFiles(data.objects.map((obj: FileObject) => ({ key: obj.name, ...obj })));
      } else {
        setFiles([]);
      }
    } catch (e) {
      setMessage("Failed to fetch files.");
      console.error('Failed to fetch files:', e);
    }
    setIsLoading(false);
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
      const resp = await proxyResult(`${apiUrl}/storage/download/${encodeURIComponent(key)}`, {
        responseType: "base64",
      });
      if (resp.ok && typeof resp.data === "string") {
        const blob = new Blob([decodeBase64(resp.data)]);
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
    } catch (e) {
      setMessage("Failed to download file.");
      console.error('Failed to fetch files:', e);
    }
  };

  // Delete single file
  const handleDelete = async (key: string) => {
    setMessage(null);
    try {
      const resp = await proxyResult(`${apiUrl}/storage/delete/${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      const data = (resp.data || {}) as { error?: string };
      if (resp.ok) {
        setMessage("File deleted.");
        fetchFiles();
      } else {
        setMessage(data.error || "Failed to delete file.");
      }
    } catch (e) {
      setMessage("Failed to delete file.");
      console.error('Failed to delete files:', e);
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    setMessage(null);
    try {
      const resp = await proxyResult(`${apiUrl}/storage/batchDelete`, {
        method: "POST",
        body: { names: selected },
      });
      const data = (resp.data || {}) as { error?: string };
      if (resp.ok) {
        setMessage("Files deleted.");
        setSelected([]);
        fetchFiles();
      } else {
        setMessage(data.error || "Failed to batch delete.");
      }
    } catch (e) {
      setMessage("Failed to batch delete.");
      console.error('Failed to batch delete files:', e);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setMessage(null);
    try {
      const fileBody = multipartFileBody(
        encodeURIComponent(uploadFile.name),
        uploadFile.type,
        new Uint8Array(await uploadFile.arrayBuffer()),
      );
      const resp = await proxyResult(`${apiUrl}/storage`, {
        method: "PUT",
        headers: { "Content-Type": fileBody.contentType },
        body: fileBody.body,
      });
      const data = (resp.data || {}) as { status?: string; error?: string };
      if (resp.ok) {
        var message = data.status;
        if (data.error) {
          message += ` ${data.error}`;
        }

        setMessage(message);
        setUploadFile(null);
        fetchFiles();
      }
    } catch (e) {
      setMessage("Failed to upload file.");
      console.error('Failed to upload files:', e);
    }
    setIsUploading(false);
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
          disabled={isUploading}
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
          disabled={!uploadFile || isUploading}
        >
          {isUploading ? <CircularProgress size={20} /> : "Upload"}
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
      {isLoading ? (
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
