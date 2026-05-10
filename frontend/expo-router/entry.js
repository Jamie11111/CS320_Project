import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import { DataProvider } from "../components/data-context";

export function App() {
    const ctx = require.context('../app', true, /\.(js|jsx|ts|tsx)$/);
    return (
    <DataProvider>
        <ExpoRoot context={ctx} />
    </DataProvider>);
}

registerRootComponent(App);