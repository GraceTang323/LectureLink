import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as profileService from '@/src/services/profile';
import { useAuth } from "../hooks/useAuth";

const CreateProfileScreen = () => {
    const [username, setUsername] = useState("");
    const [major, setMajor] = useState("");
    const [gradDate, setGradDate] = useState("");
    const [bio, setBio] = useState("");

    const { authState, setProfileComplete } = useAuth();

    const handleCreateProfile = async () => {
        if (!username || !major || !gradDate) {
            Alert.alert(
                "Missing information",
                "Please enter your username, major, and graduation date."
            );
            return;
        }

        try {
            const result = await profileService.initializeProfile(
                username.trim(), 
                major, 
                Number(gradDate), 
                authState.token,
                bio.trim(),
            );
            setProfileComplete(result.user.completed);

            Alert.alert("Successfully created profile", "Welcome! Get started by adding some interests and courses");
            
            // console.log({username, major, gradDate, bio});
        } catch (err) {
            Alert.alert("Profile creation failed", err instanceof Error ? err.message : "Something went wrong");
        };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Create Your Profile</Text>

            <Text style={styles.subtitle}>
                Tell us a little about yourself.
            </Text>

            <Text style={styles.label}>Username</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <Text style={styles.label}>Major</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your major"
                value={major}
                onChangeText={setMajor}
            />

            <Text style={styles.label}>Graduation Date</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. May 2027"
                value={gradDate}
                onChangeText={setGradDate}
            />

            <Text style={styles.label}>Bio (optional)</Text>
            <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Tell people a little about yourself..."
                value={bio}
                onChangeText={setBio}
                multiline
                textAlignVertical="top"
            />

            <Pressable
                style={styles.button}
                onPress={handleCreateProfile}
            >
                <Text style={styles.buttonText}>
                    Create Profile
                </Text>
            </Pressable>
        </View>
    );
};

export default CreateProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
    },

    header: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
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