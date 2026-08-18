import { Alert, Text, View, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { useRouter } from 'expo-router';
import LoginButton from '@/src/components/Buttons';
import { AuthContext } from '@/src/context/AuthContext';

const HomeScreen = () => {
    const router = useRouter();
    const { onLogout } = useContext(AuthContext);

    return (
        <View style = {styles.container}>
            <Text style={styles.text}>Logged in!</Text>
            <LoginButton 
                value="Log Out"
                handlePress={async () => {
                    const result = await onLogout();
                    if (result?.error) {
                        Alert.alert('Logout failed', result.message);
                        return;
                    }
                    router.push('/')
                }}
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        flex: 1,
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
        fontSize: 22,
        padding: 16,
    },
});

export default HomeScreen;