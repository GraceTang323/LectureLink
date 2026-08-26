import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Alert, 
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image,
    TouchableOpacity, TextInput, Modal, Pressable
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import * as profileService from "@/src/services/profile";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const ProfileScreen = () => {
    const { authState } = useAuth();

    const [loading, setLoading] = useState(true);           // profile fetching
    const [saving, setSaving] = useState(false);            // profile updating
    const [isUploading, setIsUploading] = useState(false);  // photo selection
    const [menuVisible, setMenuVisible] = useState(false);

    const [displayName, setDisplayName] = useState("");
    const [major, setMajor] = useState("");
    const [graduationYear, setGraduationYear] = useState("");
    const [bio, setBio] = useState("");
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const router = useRouter();
    // setCourses
    // setInterests
    // setAvailability

    useEffect(() => {
        const loadProfile = async () => {
            if (!authState.token || !authState.authenticated) {
                setLoading(false);
                return;
            }

            try {
                const result = await profileService.getMyProfile(authState.token);

                setDisplayName(result.user.display_name ?? "");
                setMajor(result.profile.major ?? "");
                setGraduationYear(result.profile.graduation_year?.toString() ?? "");
                setBio(result.profile.bio ?? "");
                setPhotoUrl(result.user.photo_url ?? null);

                console.log(result);
            } catch (err) {
                console.error("Failed to load profile:", err);
                Alert.alert("Error", "Unable to load your profile");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [authState.token]);

    const handleSave = async () => {
        if (!authState.token) {
            Alert.alert("Error", "You are not logged in");
            return;
        }
        // check that vital profile information will not removed
        if (!displayName.trim() || !major.trim() || !graduationYear.trim()) {
            Alert.alert("Missing information", "Please enter your name, major, and graduation year");
            return;
        }

        const year = Number(graduationYear);
        if (Number.isNaN(year)) {
            Alert.alert("Invalid graduation year", "Please enter a valid graduation year");
            return;
        }

        try {
            setSaving(true);
            const result = await profileService.updateProfile(
                displayName.trim(),
                major.trim(),
                year,
                authState.token,
                bio.trim(),
            );

            if (photoUrl) {
                await profileService.putMePhoto(photoUrl, authState.token);
            }

            // update profile details
            setDisplayName(result.user.display_name);
            setMajor(result.user.major);
            setGraduationYear(result.user.graduation_year.toString());
            setBio(result.user.bio ?? "");
            setPhotoUrl(photoUrl);
            // set photoUrl as well (or in another function)

            Alert.alert("Profile updated!", "Your profile has been successfully updated");

        } catch (err) {
            console.error("Failed to update profile details", err);
            Alert.alert("Update failed", "Unable to save your profile");
        } finally {
            setSaving(false);
        }
    };

    const pickImage = async () => {
        // request device gallery permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "You need to allow camera roll access to change your photo");
            return;
        }
        setIsUploading(true);

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,    // crop image to square
            aspect: [1, 1],         // ratio for profile pictures
            quality: 0.7,           // compress image
        });

        if (!result.canceled && result.assets[0].uri) {
            const localUri = result.assets[0].uri;
            setPhotoUrl(localUri); // update local UI preview
        }
        setIsUploading(false);
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
       <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}>
                    <Pressable
                        style={styles.modalOverlay}
                        onPress={() => setMenuVisible(false)}>
                            <View style={styles.menu}>
                                <Pressable
                                    onPress={() => {
                                        setMenuVisible(false);
                                        Alert.alert("TODO: Route to courses");
                                        // router.push("/courses");
                                    }}
                                    style={styles.menuItem}>
                                        <Text style={{fontSize: 16}}>Courses</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        setMenuVisible(false);
                                        Alert.alert("TODO: Route to interests");
                                        // router.push("/interests");
                                    }}
                                    style={styles.menuItem}>
                                        <Text style={{fontSize: 16}}>Interests</Text>
                                </Pressable>
                            </View>
                    </Pressable>
            </Modal>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.titleRow}>
                    <Text style={styles.title}>My Profile</Text>
                    <Pressable
                        onPress={() => setMenuVisible(true)}
                        style={styles.menuButton}>
                            <Text style={{fontSize: 28}}>⋮</Text>
                    </Pressable>
                </View>
                
                {/* Profile Picture */}
                <View style={styles.photoContainer}>
                    <Image 
                        source={photoUrl ? { uri: photoUrl } : require("@/assets/images/icon.png")}
                        style={styles.profilePhoto}
                    />
                    <TouchableOpacity
                        style={styles.changePhotoButton}
                        onPress={pickImage}
                        disabled={isUploading}>
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Display Name */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="Your name"
                        autoCapitalize="words"
                    />
                </View>

                {/* Major */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Major</Text>
                    <TextInput
                        style={styles.input}
                        value={major}
                        onChangeText={setMajor}
                        placeholder="Your major"
                    />
                </View>

                {/* Graduation Year */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Graduation Year</Text>
                    <TextInput
                        style={styles.input}
                        value={graduationYear}
                        onChangeText={setGraduationYear}
                        placeholder="2027"
                        keyboardType="numeric"
                        maxLength={4}
                    />
                </View>

                {/* Bio */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, styles.bioInput]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell people a little about yourself..."
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        maxLength={300}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
                
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 24,
    },
    menuButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    menu: {
        position: "absolute",
        top: 70,
        right: 16,
        width: 180,
        backgroundColor: "white",
        borderRadius: 10,
        paddingVertical: 8,

        // iOS shadow
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        // Android
        // elevation: 5,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    photoContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    profilePhoto: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#E5E5E5",
    },
    changePhotoButton: {
        marginTop: 12,
    },
    changePhotoText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D1D1D1",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#FAFAFA",
    },
    bioInput: {
        minHeight: 120,
    },
    characterCount: {
        textAlign: "right",
        color: "#888888",
        marginTop: 4,
        fontSize: 12,
    },
    saveButton: {
        backgroundColor: "#007AFF",
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "600",
    },
});

export default ProfileScreen;