const getAccessTokenFromCookie = () => {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "access_token") {
      return decodeURIComponent(value);
    }
  }
  return null; // Return null if not found
};

export const getHeaders = () => {
  const accessToken = getAccessTokenFromCookie();
  const headers: { [key: string]: string } = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
};

export type BoatRequest = {
  name: string;
};

export type BoatResponse = {
  color: string;
};

export async function getBoat(apiUrl: string, request: BoatRequest) {
  const response = await fetch(`${apiUrl}/boat`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      `getBoat failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as BoatResponse;
}
