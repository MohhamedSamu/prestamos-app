import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import
{
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  FlatList,
} from "react-native";
import Octicons from "@expo/vector-icons/Octicons";
// import { colors } from "@/components/styles/appStyles";
import images from "../../constants/images";

const Clients = () =>
{
  // Action when the floating button is pressed
  const handlePress = () =>
  {
    alert("Floating Button Pressed!");
  };

  // Sample data for the list
  const data = Array.from({ length: 50 }, (_, index) => ({
    id: index.toString(),
    title: `Item ${index + 1}`,
  }));

  // Render each item in the FlatList
  const renderItem = ({ item }: any) => (
    <View className="space-y-6">
      <Text className="text-xl font-psemibold text-white">{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView className="bg-primary">
      <View className="mt-6 px-4 space-y-6 mb-6 pb-20">

        <View className="flex justify-between items-start flex-row mb-6">
          <View>
            <Text className="font-pmedium text-sm text-gray-100">
              Bienvenido de regreso
            </Text>
            <Text className="text-2xl font-psemibold text-white">
              A tu control
            </Text>
          </View>
          <View className="mt-1.5">
            <Image source={images.logoSmall} className="w-9 h-10" resizeMode="contain" />
          </View>
        </View>

        <Text className="text-lg font-pregular text-gray-100 mb-3">
          Lista de clientes
        </Text>

        {/* Scrollable List */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>

        {/* Floating Button */}
        <TouchableOpacity style={styles.floatingButton} onPress={handlePress}>
          <Octicons name="diff-added" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton2} onPress={handlePress}>
          <Octicons name="diff-added" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.floatingButton3} onPress={handlePress}>
          <Octicons name="diff-added" size={24} color="white" />
        </TouchableOpacity>

    </SafeAreaView>
  );
}

export default Clients

const styles = StyleSheet.create({
  floatingButton: {
    backgroundColor: "#FF9C01", // Replace with your primary color
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 160,
    right: 10,
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButton2: {
    backgroundColor: "#FF9C01", // Replace with your primary color
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 230,
    right: 10,
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButton3: {
    backgroundColor: "#FF9C01", // Replace with your primary color
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 300,
    right: 10,
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});