import * as React from "react"
import Alert from "@mui/material/Alert"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import Divider from "@mui/material/Divider"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import { getBoat } from "../api"

type HomeProps = {
    apiUrl: string;
};

export default function Home({ apiUrl }: HomeProps) {
    const [color, setColor] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        getBoat(apiUrl, { name: "example" })
            .then((res) => setColor(res.color))
            .catch((e) => setError(String(e)));
    }, []);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
                p: 3,
            }}
        >
            <Paper elevation={3} sx={{ maxWidth: 420, width: "100%", p: 4, borderRadius: 3 }}>
                <Typography variant="h5" component="h1" fontWeight={600}>
                    Welcome to the FNS template app
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    This is the home page.
                </Typography>

                <Divider sx={{ my: 3 }} />

                {error && <Alert severity="error">{error}</Alert>}

                {!error && color === null && (
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <CircularProgress size={18} />
                        <Typography variant="body2" color="text.secondary">
                            Loading boat…
                        </Typography>
                    </Stack>
                )}

                {!error && color !== null && (
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: color, width: 28, height: 28 }}>{" "}</Avatar>
                        <Typography variant="body1">
                            Boat color: <strong>{color}</strong>
                        </Typography>
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}
