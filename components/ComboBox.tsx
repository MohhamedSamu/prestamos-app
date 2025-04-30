import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Menu } from "react-native-paper";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface Option {
  value: string;
  placeholder: string;  // Ensure placeholder is always required
  legend?: string;
}

interface CustomComboBoxProps {
  options: Option[];
  placeholder?: string;
  defaultOption: string;  // This is just the value string of the option, not the whole Option object
  onSelect: (selectedOption: Option) => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
}

const CustomComboBox: React.FC<CustomComboBoxProps> = ({
  options,
  placeholder = "Selecciona una opción",
  defaultOption,
  onSelect,
  containerStyles = "",
  textStyles = "",
  isLoading = false,
}) => {
  const [visible, setVisible] = useState(false);
  
  // Find the default option from options list
  const defaultSelected = options.find((opt) => opt.value === defaultOption) || { value: "", placeholder };
  const [selected, setSelected] = useState<Option>(defaultSelected as Option);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (selectedOption: Option) => {
    setSelected(selectedOption);
    closeMenu();
    onSelect(selectedOption);
  };

  return (
    <StyledView className="relative">
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <StyledTouchableOpacity
            onPress={openMenu}
            activeOpacity={0.7}
            className={`bg-secondary rounded-xl min-h-[50px] mb-3 flex flex-row justify-between items-center px-4 ${containerStyles} ${
              isLoading ? "opacity-50" : ""
            }`}
            disabled={isLoading}
          >
            <StyledText className={`text-primary font-psemibold text-center text-lg ${textStyles}`}>
              {selected.placeholder}  {/* 🔹 Only show placeholder in UI */}
            </StyledText>

            {isLoading ? (
              <ActivityIndicator animating color="#fff" size="small" className="ml-2" />
            ) : (
              <StyledText className="text-gray-400 text-lg">▼</StyledText>
            )}
          </StyledTouchableOpacity>
        }
      >
        {options.map((item: Option, index) => (
          <Menu.Item key={index} onPress={() => handleSelect(item)} title={item.placeholder} />
        ))}
      </Menu>
    </StyledView>
  );
};

export default CustomComboBox;
