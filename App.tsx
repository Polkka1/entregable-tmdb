import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CarteleraProvider } from './src/context/CarteleraContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <CarteleraProvider>
        <RootNavigator />
        <StatusBar style="light" />
      </CarteleraProvider>
    </SafeAreaProvider>
  );
}
