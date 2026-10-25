// @firebase/auth declara "types" antes que "react-native" en su campo exports, así que TypeScript
// toma los tipos web y no ve getReactNativePersistence, aunque Metro sí carga la versión de React Native
// donde existe. Aquí se declara con la misma firma que dist/rn/src/platform_react_native/persistence/react_native.d.ts.
import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
