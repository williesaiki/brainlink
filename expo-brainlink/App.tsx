import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import PlaceholderScreen from './screens/PlaceholderScreen';
import { colors } from './src/config/colors';
import { Mail, Lock } from 'react-native-vector-icons/Feather';

const firebaseConfig = { apiKey: "AIzaSyCsC69twn_ehvlxwjIE1u3mCHS4OiEw5ds", authDomain: "the-estate-hub.firebaseapp.com", projectId: "the-estate-hub", storageBucket: "the-estate-hub.appspot.com", messagingSenderId: "904129270236", appId: "1:904129270236:web:bee663ceacbf8210ceff19", measurementId: "G-GEMH1F52Y1" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default function App(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const Stack = createNativeStackNavigator();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // You might want to navigate here, but it's better handled within the NavigationContainer
    }
  }, [user]);
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Dashboard" : "Login"}>
        {user ? (
          <Stack.Screen name="Dashboard" options={{ headerShown: false }}>
            {() => <PlaceholderScreen />}
          </Stack.Screen>
        ) : ( <Stack.Screen name="Login" options={{ headerShown: false }}>
          {() => (
            <View style={styles.container}>
              <StatusBar style="light" />
              <View style={styles.animatedBg}>
                {/* Replace with a suitable animated background for React Native if needed */}
              </View>

              <View style={styles.content}>
                <View style={styles.loginCard}>
                  <View style={styles.header}>
                    {/* Replace Building2 with a suitable icon or image */}
                    <Text style={styles.title}>Witaj ponownie!</Text>
                    <Text style={styles.subtitle}>Zaloguj się do swojego konta</Text>
                  </View>

                  <View style={styles.form}>
                    <View style={styles.inputContainer}>
                      <Mail name="mail" size={20} color={colors.icon.primary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={colors.form.inputPlaceholder}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Lock name="lock" size={20} color={colors.icon.primary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Hasło"
                        placeholderTextColor={colors.form.inputPlaceholder}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.button, loading && styles.buttonDisabled]}
                      onPress={handleLogin}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.buttonText}>Zaloguj się</Text>
                      )}
                    </TouchableOpacity>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  </View>
                </View>
              </View>
            </View>
          )}
        </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000008', // Replace with a suitable background
    // Add any animated background styles here if needed
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loginCard: {
    width: '80%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: colors.bg.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.muted,
    textAlign: 'center',
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 16,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#010220', // Temporary hardcoded color, ideally from your extended colors
    borderColor: '#E5E5E5',       // Temporary hardcoded color
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 40,
    color: colors.text.primary,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.button.primaryBg,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.status.error,
    marginTop: 15,
  },
});
