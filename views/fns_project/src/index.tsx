import * as React from "react"
import { PiletApi } from "@procaaso/pc-piral-instance"
import Home from "./components/home"

export function setup(app: PiletApi) {
    const { apiUrl } = app.getData("data") || { apiUrl: "http://127.0.0.1:8000" };

    app.registerPage("/*", () => <Home apiUrl={apiUrl} />);
}
