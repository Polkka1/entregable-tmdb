import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Boton } from '../components/Boton';
import { Icono } from '../components/Icono';
import { useSesion } from '../context/SesionContext';
import { ALTURA_TOCABLE_MIN, colores, espacio, radio } from '../theme/tema';
import { mensajeDeError } from '../utils/errores';

type Modo = 'iniciar' | 'registro';

const TEXTOS: Record<Modo, { titulo: string; boton: string; alternar: string }> = {
  iniciar: {
    titulo: 'Inicia sesión',
    boton: 'Iniciar sesión',
    alternar: '¿No tienes cuenta? Regístrate',
  },
  registro: {
    titulo: 'Crea tu cuenta',
    boton: 'Registrarme',
    alternar: '¿Ya tienes cuenta? Inicia sesión',
  },
};

const MIN_PASSWORD = 6;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ErroresFormulario {
  email?: string;
  password?: string;
  confirmacion?: string;
}

function validar(modo: Modo, email: string, password: string, confirmacion: string): ErroresFormulario {
  const errores: ErroresFormulario = {};
  if (!email.trim()) errores.email = 'Ingresa tu correo.';
  else if (!PATRON_EMAIL.test(email.trim())) errores.email = 'El correo no tiene un formato válido.';

  if (!password) errores.password = 'Ingresa tu contraseña.';
  else if (modo === 'registro' && password.length < MIN_PASSWORD) {
    errores.password = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
  }

  if (modo === 'registro' && confirmacion !== password) errores.confirmacion = 'Las contraseñas no coinciden.';
  return errores;
}

export function LoginScreen() {
  const { iniciarSesion, registrarse } = useSesion();
  const [modo, setModo] = useState<Modo>('iniciar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const textos = TEXTOS[modo];

  const alternarModo = () => {
    setModo((m) => (m === 'iniciar' ? 'registro' : 'iniciar'));
    setErrores({});
    setErrorServidor(null);
    setConfirmacion('');
  };

  const enviar = async () => {
    const encontrados = validar(modo, email, password, confirmacion);
    setErrores(encontrados);
    setErrorServidor(null);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      // Si sale bien, SesionContext recibe el usuario y la navegación cambia sola.
      await (modo === 'iniciar' ? iniciarSesion(email, password) : registrarse(email, password));
    } catch (error) {
      setErrorServidor(mensajeDeError(error));
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.marca}>
          <Icono name="film" size={56} color={colores.acento} />
          <Text style={styles.nombreApp}>Mi Cartelera Personal</Text>
        </View>

        <Text style={styles.titulo} accessibilityRole="header">
          {textos.titulo}
        </Text>

        <Campo
          etiqueta="Correo"
          value={email}
          onChangeText={setEmail}
          error={errores.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Campo
          etiqueta="Contraseña"
          value={password}
          onChangeText={setPassword}
          error={errores.password}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
          textContentType={modo === 'registro' ? 'newPassword' : 'password'}
        />
        {modo === 'registro' && (
          <Campo
            etiqueta="Confirmar contraseña"
            value={confirmacion}
            onChangeText={setConfirmacion}
            error={errores.confirmacion}
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />
        )}

        {errorServidor && (
          <View style={styles.errorServidor} accessibilityLiveRegion="assertive">
            <Icono name="alert-circle-outline" size={20} color={colores.peligro} />
            <Text style={styles.errorServidorTexto}>{errorServidor}</Text>
          </View>
        )}

        <Boton titulo={textos.boton} cargando={enviando} onPress={enviar} />

        <Pressable onPress={alternarModo} accessibilityRole="button" style={styles.alternar}>
          <Text style={styles.alternarTexto}>{textos.alternar}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ etiqueta, error, ...props }: TextInputProps & { etiqueta: string; error?: string }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        {...props}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colores.textoSecundario}
        accessibilityLabel={etiqueta}
        accessibilityHint={error}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espacio.xl,
    gap: espacio.lg,
  },
  marca: {
    alignItems: 'center',
    gap: espacio.sm,
    marginBottom: espacio.lg,
  },
  nombreApp: {
    color: colores.texto,
    fontSize: 26,
    fontWeight: '800',
  },
  titulo: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '600',
  },
  campo: {
    gap: espacio.xs,
  },
  etiqueta: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    minHeight: ALTURA_TOCABLE_MIN + 4,
    paddingHorizontal: espacio.md,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    color: colores.texto,
    fontSize: 16,
  },
  inputError: {
    borderColor: colores.peligro,
  },
  error: {
    color: colores.peligro,
    fontSize: 13,
  },
  errorServidor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    padding: espacio.md,
    borderRadius: radio.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.peligro,
  },
  errorServidorTexto: {
    flex: 1,
    color: colores.texto,
    fontSize: 14,
  },
  alternar: {
    minHeight: ALTURA_TOCABLE_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternarTexto: {
    color: colores.acento,
    fontSize: 15,
    fontWeight: '600',
  },
});
