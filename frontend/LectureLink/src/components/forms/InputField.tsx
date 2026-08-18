import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from 'react';
import { Ionicons } from "@expo/vector-icons"

type InputFieldProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: ( text: string ) => void;
  secureTextEntry?: boolean;
}

const InputField = ({
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false
}: InputFieldProps) => {
  const [hidePassword, setHidePassword] = useState<boolean>(secureTextEntry);
  
  return (
    <View style={styles.rowContainer}>
      {icon && (
        <Ionicons
          name={icon}
          size={22}
          color="#ccc"
          style={{marginRight: 4}}
        />
      )}
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && hidePassword}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setHidePassword((prev) => !prev)}
          >
            <Ionicons
              name={hidePassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#a3a3a3"
            />
          </TouchableOpacity>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row', // aligns items horizontally
    alignItems: 'center',
    padding: 20,
  },
  input: {
    flex: 1, // 
    height: 40,
    marginHorizontal: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10
  }
});

export default InputField;