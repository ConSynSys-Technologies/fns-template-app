export type BoatRequest = {
    name: string;
};

export type BoatResponse = {
    color: string;
};

export async function getBoat(apiUrl: string, request: BoatRequest) {
    const response = await fetch(`${apiUrl}/boat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`getBoat failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as BoatResponse;
}
