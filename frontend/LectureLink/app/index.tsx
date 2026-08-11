import { Text, View, StyleSheet } from "react-native";
import LoginScreen from '@/src/screens/LoginScreen'
import RegisterScreen from '@/src/screens/RegisterScreen'

export default function Index() {
  return (
    <View style={styles.container}>
      <RegisterScreen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#eee',
    padding: 20,
    borderRadius: 5,
    boxShadow: '4px 4px rgba(0,0,0,0.1)',
  }
})