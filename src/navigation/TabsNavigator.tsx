import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icono, type NombreIcono } from '../components/Icono';
import { AcercaDeScreen } from '../screens/AcercaDeScreen';
import { BuscarScreen } from '../screens/BuscarScreen';
import { MiListaScreen } from '../screens/MiListaScreen';
import { colores } from '../theme/tema';
import type { TabsParamList } from '../types/navegacion';

const Tabs = createBottomTabNavigator<TabsParamList>();

const ICONO_PESTANA: Record<keyof TabsParamList, { activo: NombreIcono; inactivo: NombreIcono }> = {
  Buscar: { activo: 'search', inactivo: 'search-outline' },
  MiLista: { activo: 'bookmark', inactivo: 'bookmark-outline' },
  AcercaDe: { activo: 'information-circle', inactivo: 'information-circle-outline' },
};

export function TabsNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colores.acento,
        tabBarInactiveTintColor: colores.textoSecundario,
        tabBarIcon: ({ focused, color, size }) => {
          const iconos = ICONO_PESTANA[route.name];
          return <Icono name={focused ? iconos.activo : iconos.inactivo} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Buscar" component={BuscarScreen} options={{ title: 'Buscar' }} />
      <Tabs.Screen name="MiLista" component={MiListaScreen} options={{ title: 'Mi lista' }} />
      <Tabs.Screen name="AcercaDe" component={AcercaDeScreen} options={{ title: 'Acerca de' }} />
    </Tabs.Navigator>
  );
}
