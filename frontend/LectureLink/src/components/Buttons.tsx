import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

type LoginButtonProp = {
    value: string;
    handlePress: () => void;
}

export default function LoginButton({
    value, handlePress
}: LoginButtonProp) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed
            ]}
            onPress={handlePress}>
            <Text style={styles.text}>{value}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
    backgroundColor: '#6200EE',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});