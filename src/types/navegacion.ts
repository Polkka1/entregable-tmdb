import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TipoMedio } from './lista';

export type TabsParamList = {
  Buscar: undefined;
  MiLista: undefined;
  AcercaDe: undefined;
};

export type RootStackParamList = {
  // Sin sesión
  Login: undefined;
  // Con sesión
  Tabs: NavigatorScreenParams<TabsParamList>;
  Detalle: { tipo: TipoMedio; id: number; titulo: string };
  EditarEntrada: { itemId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// Una pestaña también puede navegar a las pantallas de la pila que la contiene.
export type TabsScreenProps<T extends keyof TabsParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

// Tipa globalmente useNavigation() sin tener que pasarle genéricos en cada componente.
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
