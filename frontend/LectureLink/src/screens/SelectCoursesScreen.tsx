import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text, TextInput, 
    FlatList, Pressable } from "react-native";
import { useAuth } from "../hooks/useAuth";
import * as profileService from "@/src/services/profile";
import { useRouter } from "expo-router";

const MAX_LENGTH = 5;

type Course = {
    id: number;
    course_code: string;
    course_name: string;
};

type CourseProps = {
    course: Course;
    selected: boolean;
    onPress: () => void;
};

const CourseItem = ({course, selected, onPress}: CourseProps) => {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.item,
                selected && styles.selectedItem,
            ]}>
            <View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={styles.courseCode}>{course.course_code}</Text>
                    {selected && (<Text>✓</Text>)}
                </View>
                <Text style={styles.itemText}>{course.course_name}</Text>
            </View>
        </Pressable>
    );
}

const SelectCoursesScreen = () => {
    const { authState, setProfileComplete } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [courses, setCourses] = useState<Course[]>([]);   // all courses available to select
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);   // course IDs the user selected
    const [search, setSearch] = useState(""); // filter search

    const router = useRouter();

    useEffect(() => {
        const loadCourses = async () => {
            if (!authState.token) {
                setLoading(false);
                return;
            }
            try {
                const result = await profileService.getCourses(authState.token);
                setCourses(result.courses);

            } catch (err) {
                console.error("Failed to load courses", err);
                Alert.alert("Error", "Unable to load courses");
            } finally {
                setLoading(false);
            }
        };
        loadCourses();
    }, [authState.token]);

    const toggleCourse = (courseId: number) => {
        setSelectedCourses(prev => {
            // second tap removes course from selection
            if (prev.includes(courseId)) {
                return prev.filter(id => id !== courseId);
            }
            // reject selections over the limit
            if (prev.length >= MAX_LENGTH) {
                Alert.alert("Maximum Reached", `You can select a maximum of ${MAX_LENGTH} courses.`);
                return prev;
            }
            return [...prev, courseId];
        })
    }

    const filteredCourses = courses.filter(course => {
        const query = search.toLowerCase();

        return (
            course.course_code.toLowerCase().includes(query) || 
            course.course_name.toLowerCase().includes(query)
        );
    })

    const handleSave = async () => {
        if (!authState.token) {
            Alert.alert("Error", "You are not logged in");
            return;
        }

        try {
            setSaving(true);
            const result = await profileService.updateCourses(selectedCourses, authState.token);
            const courses = result.courses;

            // clear all current selections
            setSelectedCourses([]);
            
            console.log("Courses saved:", courses);
            Alert.alert("Courses updated!", "Your courses have been successfully saved");

            // set profile as complete
            await profileService.putMeProfileComplete(authState.token);
            setProfileComplete(true); // updating authState triggers navigation guard

        } catch (err) {
            console.error("Failed to update courses", err);
            Alert.alert("Update failed", "Unable to save your courses");
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
                data={filteredCourses}
                renderItem={({item}) => (
                    <CourseItem 
                        course={item}
                        selected={selectedCourses.includes(item.id)}
                        onPress={() => toggleCourse(item.id)}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle= {styles.listContent}
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Courses</Text>
                        <View style={styles.container}>
                            <TextInput 
                                style={styles.input}
                                placeholder="Search courses..."
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                        <Text style={{marginLeft: 20, paddingVertical: 8}}>{selectedCourses.length} / 5 selected</Text>
                    </>
                }
            />

            {selectedCourses.length > 0 && (
                <View style={styles.saveContainer}>
                    <Pressable
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={saving}>
                            {saving ? (
                                <ActivityIndicator color="#fff"/>
                            ) : (
                                <Text style={styles.saveButtonText}>
                                    Save {selectedCourses.length} Course{selectedCourses.length === 1 ? "" : "s"}
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
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
    },
    selectedItem: {
        backgroundColor: '#f399ff',
    },
    itemText: {
        fontSize: 16,
    },
    selectedItemText: {
        color: '#fbdeff',
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

export default SelectCoursesScreen;