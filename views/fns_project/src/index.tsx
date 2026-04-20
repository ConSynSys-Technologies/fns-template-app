import * as React from "react"
import { PiletApi } from "@procaaso/pc-piral-instance"
import { getConfig } from "./api"

export function setup(app: PiletApi) {
    const { apiUrl } = app.getData("data") || { apiUrl: "http://127.0.0.1:8000" };

    app.registerPage("/*", () => {
        const [configValue, setConfigValue] = React.useState<string | null>(null);
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
            getConfig(apiUrl, { request_value: "example" })
                .then((res) => setConfigValue(res.config_value))
                .catch((e) => setError(String(e)));
        }, []);

        if (error) return <p>Error: {error}</p>;
        if (configValue === null) return <p>Loading...</p>;
        return <p>Config value: {configValue}</p>;
    });
}
