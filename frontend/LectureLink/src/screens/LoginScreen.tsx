import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { Link } from 'expo-router';
import InputField from '@/src/components/forms/InputField'
import LoginButton from '@/src/components/Buttons'
import { useAuth } from '@/src/hooks/useAuth';

const LoginScreen = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const { onLogin } = useAuth();

    const handleLogin = async () => {
        const result = await onLogin(email, password);
                    
        if (result?.error) {
            Alert.alert('Login failed', result.message);
            return;
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Login</Text>

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

            <LoginButton
                value="Log In"
                handlePress={handleLogin}
            />
            <View style={{flexDirection: 'row'}}>
                <Text style={{marginVertical: 12, marginLeft: 12}}>Don't have an account?</Text>
                <Link href = "/register" style={{marginVertical: 12, marginLeft: 5, color: "#2063ff"}}>Register Now!</Link>
            </View>
        </View>
    )
}

export default LoginScreen

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
        justifyContent: 'center',
    }
})