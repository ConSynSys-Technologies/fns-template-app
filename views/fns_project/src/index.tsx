import * as React from "react"
import { PiletApi } from "@procaaso/pc-piral-instance"

export function setup(app: PiletApi) {
    const value = app.getData("data") || { apiUrl: "http://127.0.0.1:8000" };
    app.registerPage("/*", () => (
       <>
       <p>Hello World</p>
       </>
    ));
}