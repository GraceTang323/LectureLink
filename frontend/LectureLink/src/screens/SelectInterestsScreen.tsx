import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text, TextInput, 
    FlatList, Pressable } from "react-native";
import { useAuth } from "../hooks/useAuth";
import * as profileService from "@/src/services/profile";
import { useRouter } from "expo-router";

const MAX_LENGTH = 5;

type Interest = {
    id: number,
    name: string,
}

type InterestProps = {
    interest: Interest,
    selected: boolean,
    onPress: () => void,
}

const InterestItem = ({interest, selected, onPress}: InterestProps) => {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.item, 
                selected && styles.selectedItem]}
        >
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text>{interest.name}</Text>
                {selected && (<Text>✓</Text>)}
            </View>
        </Pressable>
    )
}

const SelectInterestsScreen = () => {
    const { authState, setProfileComplete } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [interests, setInterests] = useState<Interest[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
    const [search, setSearch] = useState("");

    // const router = useRouter();

    useEffect(() => {
        const loadInterests = async () => {
            if (!authState.token) {
                setLoading(false);
                return;
            }
            try {
                const result = await profileService.getInterests(authState.token);
                setInterests(result.interests);

            } catch (err) {
                console.error("Failed to load interests", err);
                Alert.alert("Error", "Unable to load interests");
            } finally {
                setLoading(false);
            }
        };
        loadInterests();
    }, [authState.token]);

    const toggleInterest = (interestId: number) => {
        setSelectedInterests(prev => {
            if (prev.includes(interestId)) {
                return prev.filter(id => id !== interestId);
            }

            if (prev.length >= MAX_LENGTH) {
                Alert.alert("Maximum Reached", `You can select a maximum of ${MAX_LENGTH} interests.`);
                return prev;
            }
            return [...prev, interestId];
        })
    }

    const filteredInterests = interests.filter(interest => {
        const query = search.toLowerCase();

        return interest.name.toLowerCase().includes(query);
    });

    const handleSave = async () => {
        if (!authState.token) {
            Alert.alert("Error", "You are not logged in");
            return;
        }

        try {
            setSaving(true);

            const result = await profileService.updateInterests(selectedInterests, authState.token);
            const interests = result.interests;

            setSelectedInterests([]); // clear selection

            console.log("Saved interests:", interests);
            Alert.alert("Interests updated!", "Your interests have been successfully saved");

            // set profile as complete and update authState
            await profileService.putMeProfileComplete(authState.token);
            setProfileComplete(true); // updating authState triggers navigation guard

        } catch (err) {
            console.error("Failed to save interests", err);
            Alert.alert("Update failed", "Unable to save your interests");
        } finally {
            setSaving(false);
        }
    }

    if (loading || saving) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return (
        <View>
            <FlatList
                data={filteredInterests}
                renderItem={({item}) => (
                    <InterestItem 
                        interest={item}
                        selected={selectedInterests.includes(item.id)}
                        onPress={() => toggleInterest(item.id)}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Interests</Text>
                        <View style={styles.container}>
                            <TextInput 
                                style={styles.input}
                                placeholder="Search interests..."
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                        <Text style={{marginLeft: 20, paddingVertical: 8}}>{selectedInterests.length} / {MAX_LENGTH} selected</Text>
                    </>
                }
            />
            {selectedInterests.length > 0 && (
                <View style={styles.saveContainer}>
                    <Pressable 
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={saving}>
                            {saving ? (
                                <ActivityIndicator size="large"/>
                            ) : (
                                <Text style={styles.saveButtonText}>
                                    Save {selectedInterests.length} Interest{selectedInterests.length === 1 ? "" : "s"}
                                </Text>
                            )}
                    </Pressable>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 120,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginTop: 20,
        marginLeft: 20,
        marginBottom: 8,
    },
    item: {
        backgroundColor: '#c2d8ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
    },
    selectedItem: {
        backgroundColor: '#9999ff',
    },
    itemText: {
        fontSize: 16,
    },
    selectedItemText: {
        color: '#dee9ff',
        fontSize: 20,
    },
    courseCode: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        width: 350,
        borderWidth: 1,
        borderColor: "#D1D1D1",
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 20,
        backgroundColor: "#FAFAFA",
    },
    saveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 24,
    },
    saveButton: {
        height: 52,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e417ff',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '500',
    },
});

export default SelectInterestsScreen;