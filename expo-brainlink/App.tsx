import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';import PlaceholderScreen from './screens/PlaceholderScreen';

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
          {() => ( <View style={styles.container}>
            <Text>Login</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            {loading ? (<ActivityIndicator size="large" color="#0000ff" />) : (<Button title="Login" onPress={handleLogin} />)}
            <StatusBar style="auto" />
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
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    marginBottom: 10,
  },
});
