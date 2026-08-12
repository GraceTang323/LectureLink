import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import LoginButton from '@/src/components/Buttons'

const HomeScreen = () => {
    const router = useRouter();
    return (
        <View style = {styles.container}>
            <Text style={styles.text}>Logged in!</Text>
            <LoginButton 
                value="Log Out"
                handlePress={() => router.back()}
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