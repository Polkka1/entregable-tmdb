import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { Cargando } from '../components/EstadosPantalla';
import { CarteleraProvider } from '../context/CarteleraContext';
import { useSesion } from '../context/SesionContext';
import { DetalleScreen } from '../screens/DetalleScreen';
import { EditarEntradaScreen } from '../screens/EditarEntradaScreen';
import { LoginScreen } from '../screens/LoginScreen';
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

export function RootNavigator() {
  const { usuario, verificando } = useSesion();

  if (verificando) {
    return (
      <View style={{ flex: 1, backgroundColor: colores.fondo }}>
        <Cargando texto="Verificando sesión…" />
      </View>
    );
  }

  // Navegación condicional: sin sesión solo existe Login; con sesión, la app.
  // CarteleraProvider se monta con key={uid} para que cada cuenta empiece con su propia lista.
  return (
    <NavigationContainer theme={tema}>
      {usuario ? (
        <CarteleraProvider key={usuario.uid} usuario={usuario}>
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
        </CarteleraProvider>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
