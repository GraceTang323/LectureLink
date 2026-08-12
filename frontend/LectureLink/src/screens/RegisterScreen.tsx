import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { useRouter, Link } from 'expo-router';
import InputField from '@/src/forms/InputField'
import LoginButton from '@/src/components/Buttons'

const RegisterScreen = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const router = useRouter();

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
            value={password}
            secureTextEntry={true}
            onChangeText={setPassword}
            />

            <LoginButton
                value="Sign Up"
                handlePress={() => router.push('/home')}
            />

            <View style={{flexDirection: 'row'}}>
                <Text style={{marginVertical: 12, marginLeft: 12}}>Already have an account?</Text>
                <Link href = "/" style={{marginVertical: 12, marginLeft: 5, color: "#2063ff"}}>Log In</Link>
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