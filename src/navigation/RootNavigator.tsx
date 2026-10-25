import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DetalleScreen } from '../screens/DetalleScreen';
import { EditarEntradaScreen } from '../screens/EditarEntradaScreen';
import { colores } from '../theme/tema';
import type { RootStackParamList } from '../types/navegacion';
import { TabsNavigator } from './TabsNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const tema: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colores.acento,
    background: colores.fondo,
    card: colores.superficie,
    text: colores.texto,
    border: colores.borde,
  },
};

// Paso 4: aquí se agregará la navegación condicional según la sesión de Firebase Auth
// (pila de Login/Registro sin sesión; esta pila con sesión).
export function RootNavigator() {
  return (
    <NavigationContainer theme={tema}>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name="Detalle"
          component={DetalleScreen}
          options={({ route }) => ({ title: route.params.titulo, headerBackTitle: 'Atrás' })}
        />
        <Stack.Screen
          name="EditarEntrada"
          component={EditarEntradaScreen}
          options={{ title: 'Editar mi entrada', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
