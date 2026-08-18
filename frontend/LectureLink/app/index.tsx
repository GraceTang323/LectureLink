import { Text, View, StyleSheet } from "react-native";
import { useContext } from 'react'
import LoginScreen from '@/src/screens/LoginScreen'
import HomeScreen from '@/src/screens/HomeScreen'
import { AuthContext } from '@/src/context/AuthContext';

export default function Index() {
  const { authState } = useContext(AuthContext);

  if (authState.authenticated) {
    return <HomeScreen/>
  } else {
    return <LoginScreen/>
  }
}