import React from "react";
import { Text, View, Image, ScrollView } from "react-native";
import FloatingActionButton from "../../components/FloatingActionButton";
import images from "../../constants/images";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';

interface FloatingButtonConfig {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;  // Added label to provide tooltip text
  onPress: () => void;
}

const Transactions = () => {
  const router = useRouter();

  const floatingButtons: FloatingButtonConfig[] = [
    { icon: "person-add", label:"Agregar cliente", onPress: () => router.push('/pages/create-client') },
    { icon: "payments", label:"Agregar pago", onPress: () => router.push('/pages/do-payment') },
    { icon: "rate-review", label:"Nueva deuda", onPress: () => router.push('/pages/new-lend') },
  ];

  const data = Array.from({ length: 50 }, (_, index) => ({
    id: index.toString(),
    title: `Juan Carlos me pago ${index + 1} en la fecha ...`,
  }));

  return (
    <SafeAreaView className="bg-primary">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mt-6 px-4 space-y-6 mb-6 pb-20 pt-5">
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
              <Image
                source={images.logoSmall}
                className="w-9 h-10"
                resizeMode="contain"
              />
            </View>
          </View>

          <Text className="text-2xl text-center font-pregular text-gray-100 mb-3">
            Lista de transacciones
          </Text>

          {/* Mapping through the data and rendering it inside ScrollView */}
          {data.map((item) => (
            <View key={item.id} className="space-y-6">
              <Text className="text-xl font-psemibold text-white">{item.title}</Text>
            </View>
          ))}

        </View>
      </ScrollView>
      <FloatingActionButton buttons={floatingButtons} />
    </SafeAreaView>
  );
};
export default Transactions