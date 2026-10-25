import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SesionProvider } from './src/context/SesionContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SesionProvider>
        <RootNavigator />
        <StatusBar style="light" />
      </SesionProvider>
    </SafeAreaProvider>
  );
}
