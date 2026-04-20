export type ConfigRequest = {
    request_value: string;
};

export type ConfigResponse = {
    config_value: string;
};

export async function getConfig(apiUrl: string, request: ConfigRequest) {
    const response = await fetch(`${apiUrl}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`getConfig failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as ConfigResponse;
}
