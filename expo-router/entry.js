import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

export function App() {
    const ctx = require.context('../app', true, /\.(js|jsx|ts|tsx)$/);
    return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);