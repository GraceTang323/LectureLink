import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import InputField from '@/src/forms/InputField'
import LoginButton from '@/src/components/Buttons'

const RegisterScreen = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');

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
                handlePress={() => Alert.alert("Button pressed")}
            />

            <Text style={{padding: 12}}>Already have an account? Log in</Text>
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
    }
})