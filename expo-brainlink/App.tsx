import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Input, Button, Icon } from 'react-native-elements';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../store/authStore';
import Dashboard from './src/screens/Dashboard';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/lib/firebase';
import { useToast } from 'sonner';

const Stack = createNativeStackNavigator();

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigation = useNavigation<any>();
    const toast = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('Dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleSubmit = async () => {
    if (!email || !password) {
        toast.error('Please provide email and password');
        return;
    }

    setIsLoading(true);
    try {
        const success = await login(email, password);
        if (!success) {
            toast.error('Invalid credentials');
        }
    } catch (error) {
        toast.error('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[style.container, style.loadingContainer]}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={style.container}>
      <Text h1 style={style.title}>
        Login
      </Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        containerStyle={style.inputContainer}
        inputStyle={style.input}
        leftIcon={<Icon type="font-awesome" name="envelope" color="white" />}
        leftIconContainerStyle={style.leftIconContainer}
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        containerStyle={style.inputContainer}
        inputStyle={style.input}
        secureTextEntry={true}
        leftIcon={<Icon type="font-awesome" name="lock" color="white" />}
        leftIconContainerStyle={style.leftIconContainer}
      />
      <Button
        buttonStyle={style.button}
        onPress={handleSubmit}
        title="Login"
        titleStyle={style.buttonTitle}
        disabled={isLoading}
      />
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00008B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    marginBottom: 30,
  },
  input: {
    color: 'white',
  },
  inputContainer: {
    borderColor: 'white',
  },
  leftIconContainer: {
    marginRight: 10,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonTitle: {
    color: '#00008B',
  },
});



export default App;

      if (success) {
        navigation.replace('Dashboard');
      }
  }

  return (
    <View style={style.container}>
      <Text h1 style={style.title}>Login</Text>
      <Input placeholder='Email' value={email} onChangeText={setEmail} containerStyle={style.inputContainer} inputStyle={style.input} leftIcon={{ type: 'font-awesome', name: 'envelope', color: 'white' }} leftIconContainerStyle={style.leftIconContainer}/>
      <Input placeholder='Password' value={password} onChangeText={setPassword} containerStyle={style.inputContainer} inputStyle={style.input} secureTextEntry={true} leftIcon={{ type: 'font-awesome', name: 'lock', color: 'white' }} leftIconContainerStyle={style.leftIconContainer}/>
        <Button buttonStyle={style.button} onPress={handleSubmit} title="Login" titleStyle={style.buttonTitle} loading={loading}/>
    </View>
  )
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default App;

const style = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#00008B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: 'white',
    marginBottom: 30,
  },
  input: {
    color: 'white',
  },
  inputContainer: {
    borderColor: 'white',
  },
  leftIconContainer: {
    marginRight: 10,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonTitle: {
    color: '#00008B',
  },
});

export default LoginScreen;