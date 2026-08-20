import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { useRouter, Link } from 'expo-router';
import InputField from '@/src/components/forms/InputField'
import LoginButton from '@/src/components/Buttons'
import { useAuth } from '@/src/hooks/useAuth';

const RegisterScreen = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const router = useRouter();
    const { onRegister } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Register</Text>

            <Text style={styles.title}>Email</Text>
            <InputField
            icon="mail"
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
            />

            <Text style={styles.title}>Password</Text>
            <InputField
            icon="lock-closed"
            placeholder="Enter password"
            value={password}
            secureTextEntry={true}
            onChangeText={setPassword}
            />

            <Text style={styles.title}>Confirm Password</Text>
            <InputField
            icon="lock-closed"
            placeholder="Confirm password"
            value={confirmPassword}
            secureTextEntry={true}
            onChangeText={setConfirmPassword}
            />

            <LoginButton
                value="Sign Up"
                handlePress={ async () => {
                    const result = await onRegister(email, password, confirmPassword);

                    if (result?.error) {
                        Alert.alert("Oops, something went wrong", result.message);
                        return;
                    }
                    router.push('/profile');
                }}
            />

            <View style={{flexDirection: 'row'}}>
                <Text style={{marginVertical: 12, marginLeft: 12}}>Already have an account?</Text>
                <Link href = ".." style={{marginVertical: 12, marginLeft: 5, color: "#2063ff"}}>Log In</Link>
            </View>
        </View>
    )
}

export default RegisterScreen

const styles = StyleSheet.create({
    header: {
        fontWeight: 'bold',
        fontSize: 22,
        textAlign: 'center',
        padding: 16,
    },
    title: {
        fontWeight: '500',
        fontSize: 18,
        marginLeft: 14,
    },
    container: {
        paddingHorizontal: 16,
        flex: 1,
        justifyContent: "center",
    }
})