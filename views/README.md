# Overall (install, integrate, run)

This guide explains how to integrate styling inside a Shadow DOM environment, while preserving full theme support and popper-based component behavior and how to deal with the dependencies.

This project structure helps prevent style conflicts between the main application and FNS applications by isolating styles within the Shadow DOM. It allows for better control over rendering and visual consistency across environments.

---

## What's Included

- `withShadowDOM` — HOC to render components inside Shadow DOM.
- Custom `ThemeProvider` — Applies light/dark theme to components within Shadow DOM.
- `usePortalContainer` — Provides a shared container for popper-based components (Tooltip, DatePicker, etc).

---

## Dependencies

1. You must have access to our internal tool named Syndi
2. Install npm - [LINK](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

```bash
npm config set registry https://npm.procaas.us/
```

Go inside the views folder

```bash
cd ./views
SYNDI_ID_TOKEN=`syndi auth token --id` npm install --legacy-peer-deps
```
Go inside the frontend folder

```bash
cd ./system-run-log-and-file-handling
SYNDI_ID_TOKEN=`syndi auth token --id` npm install --legacy-peer-deps
```

## Run the app
```bash
cd ./views/system-run-log-and-file-handling
npm start -- --port 3000
```

## How to Use Shadow DOM

### 1. Wrap a component with `withShadowDOM`

```tsx
import withShadowDOM from "./withShadowDOM";

const App = () => {
  return <MyCustomComponent />;
};

export default withShadowDOM(App);
```

You can optionally provide styles and external stylesheets in index.tsx:

```tsx
import customCss from "./styles/style.css";

export function setup(app: PiletApi) {
  app.registerPage("/*", () => (
    <App
      styles={[customCss.toString()]}
      links={["https://fonts.googleapis.com/css?family=Roboto"]}
    />
  ));
}
```

---

### 2. Provide Theme Support

Wrap your Shadow DOM-rendered component in your custom `ThemeProvider`. It automatically applies either light or dark theme based on `localStorage`:

```tsx
<MuiThemeProvider theme={darkMode ? darkTheme : lightTheme}>
  {children}
</MuiThemeProvider>
```

`withShadowDOM` already includes the necessary `CacheProvider` and emotion container.

---

### 3. Use `usePortalContainer`

This React context hook returns the current shadow root element for popper-based positioning:

```tsx
const container = usePortalContainer();
```

Use it to fix components that render outside the shadow tree (Tooltip, DatePicker).

---

### 4. Custom Tooltip

Use custom `Tooltip` instead of MUI Tooltip:

```tsx
import Tooltip from "./common/Tooltip";

<Tooltip title="Hello!">Tooltip text</Tooltip>;
```

This ensures the popper is rendered inside the shadow container.

---

## Notes

- Tooltip, DatePicker, Autocomplete, and Menu use Popper and render outside by default. Using a shared container helps keep them inside Shadow DOM.
- You can extend this pattern to support Dialog, Popover, Select, etc.
- For consistent styling, use MUI's `sx` or your custom theme tokens inside your `ThemeProvider`.

---

## Folder Structure Suggestion

```
src/
├── common/
|   ├── Dialog.tsx
|   └── Tooltip.tsx
├── context/
|   └── ThemeProvider.tsx
├── shadow/
│   ├── withShadowDOM.tsx
│   ├── usePortalContainer.tsx
```
