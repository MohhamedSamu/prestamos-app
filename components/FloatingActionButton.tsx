import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Animated } from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { Octicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface FloatingButtonConfig {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}

interface FloatingActionButtonProps {
  buttons: FloatingButtonConfig[];
  isInitiallyExpanded?: boolean; // Prop to control initial expansion state
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ buttons, isInitiallyExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const [animatedValue] = useState(new Animated.Value(isInitiallyExpanded ? 1 : 0)); // Animate expansion

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    Animated.spring(animatedValue, {
      toValue: isExpanded ? 0 : 1,
      friction: 5,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  // Reset expansion state when returning to the screen
  useFocusEffect(
    React.useCallback(() => {
      setIsExpanded(false);
      Animated.spring(animatedValue, {
        toValue: 0,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Render additional buttons dynamically */}
      {isExpanded &&
        buttons.map((button, index) => (
          <Animated.View
            key={index}
            style={[
              styles.buttonWrapper,
              { bottom: 80 + index * 70, opacity: animatedValue },
            ]}
          >
            <View style={styles.tooltipWrapper}>
              <Text style={styles.tooltip}>{button.label}</Text>
            </View>

            <TouchableOpacity
              style={styles.floatingButton}
              onPress={button.onPress}
            >
              <MaterialIcons name={button.icon} size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>
        ))}

      {/* Main floating button with animation */}
      <TouchableOpacity style={styles.mainButton} onPress={toggleExpanded}>
        <Animated.View
          style={[
            {
              transform: [
                {
                  scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        >
          <Octicons name={isExpanded ? "x" : "plus"} size={24} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingActionButton;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    right: 0,
    zIndex: 9999,
  },
  buttonWrapper: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  tooltipWrapper: {
    position: "absolute",
    left: -120,
    zIndex: 1,
    maxWidth: 120,
  },
  tooltip: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 14,
    opacity: 0.8,
  },
  mainButton: {
    backgroundColor: "#FF9C01",
    width: 60,
    height: 60,
    right: 10,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButton: {
    backgroundColor: "#FF9C01",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
