import { Alert, Text, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import LoginButton from '@/src/components/Buttons';
import { useAuth } from '../hooks/useAuth';
import * as ProfileService from '@/src/services/profile';
import ConfirmationModal from '../components/ConfirmationModal';


const HomeScreen = () => {
    const [visible, setVisible] = useState(false);

    const { authState, onLogout, resetAuth } = useAuth();
    const router = useRouter();

    const handleDelete = async () => {
        setVisible(false);
        // delete user from database
        const result = await ProfileService.deleteAccount(authState.token);

        if (result?.error) {
            Alert.alert("Deletion failed", result.message);
            return;
        }
        // clear global data
        await resetAuth();
        Alert.alert("Successfully deleted account", "Your account has been deleted, rerouting you back to login");
    }

    const handleCancel = () => {
        setVisible(false);
    }

    return (
        <View style = {styles.container}>
            <Text style={styles.text}>Logged in!</Text>

            <Text style={styles.subtitle}>More features coming soon!</Text>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <LoginButton 
                    value="Log Out"
                    handlePress={async () => {
                        const result = await onLogout();
                        if (result?.error) {
                            Alert.alert('Logout failed', result.message);
                            return;
                        }
                        // router.navigate('/');
                    }}
                />
                <LoginButton 
                    value="Delete Account"
                    handlePress={() => setVisible(true)}
                />

                <ConfirmationModal
                    visible={visible}
                    title="Delete your account?"
                    message="This action is permanent and cannot be undone."
                    onConfirm={handleDelete}
                    onCancel={handleCancel}
                />
            </View>
            
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    text: {
        textAlign: 'center',
        fontSize: 22,
        padding: 16,
    },
    subtitle: {
        textAlign: "center",
        color: "#666",
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 18,
    },
    bioInput: {
        height: 100,
    },
    button: {
        backgroundColor: "#6200EE",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default HomeScreen;