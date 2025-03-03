import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

interface NumberFieldProps extends Omit<TextInputProps, "keyboardType" | "value" | "onChangeText"> {
  title: string;
  value: number; // Ensure it's a number
  placeholder: string;
  handleChangeText: (num: number) => void;
  otherStyles?: string;
}

const NumberField: React.FC<NumberFieldProps> = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles = "",
  ...props
}) => {
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100 font-pmedium">{title}</Text>

      <View className="w-full h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary flex flex-row items-center">
        <TextInput
          className="flex-1 text-white font-psemibold text-base"
          value={value.toString()} // Ensure it's always a string
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          keyboardType="numeric" // Restrict to numeric input
          onChangeText={(text) => {
            const numericValue = text ? parseFloat(text) : 0; // Convert text to number safely
            handleChangeText(numericValue);
          }}
          {...props}
        />
      </View>
    </View>
  );
};

export default NumberField;
