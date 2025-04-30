import React, { useEffect, useState, useCallback } from "react";
import { Text, View, Image, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import images from "../../constants/images";
import FloatingActionButton from "../../components/FloatingActionButton";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ClientsService } from "../../lib/ClientsService";
import { ClientDocument } from "../../lib/types";
import { useFocusEffect } from "expo-router";

interface FloatingButtonConfig {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}

const Clients = () => {
  const [clients, setClients] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const clientService = new ClientsService();

  const floatingButtons: FloatingButtonConfig[] = [
    { icon: "person-add", label: "Agregar cliente", onPress: () => router.push("/pages/create-client") },
    { icon: "payments", label: "Agregar pago", onPress: () => router.push("/pages/do-payment") },
    { icon: "rate-review", label: "Nueva deuda", onPress: () => router.push("/pages/new-lend") },
  ];

  const loadClients = async () => {
    try {
      setLoading(true); // Start loading
      const data = await clientService.getAllClients();

      console.log("data", data);
      

      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Reload clients when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

  return (
    <SafeAreaView className="bg-primary flex-1">
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
            Lista de clientes
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" className="mt-10" />
          ) : clients.length === 0 ? (
            <Text className="text-lg text-center font-pregular text-gray-400">
              No hay clientes aún.
            </Text>
          ) : (
            clients.map((client) => (
              <View key={client.$id} className="my-2">
                <Text className="text-xl font-psemibold text-white">{client.nombre}</Text>
              </View>
            ))

            &&

            clients.map((client) => (
              <TouchableOpacity
                key={client.$id}
                className="my-2"
                onPress={() => router.push(`/pages/client-details?clientId=${client.$id}`)}
              >
                <Text className="text-xl font-psemibold text-white">{client.nombre}</Text>
              </TouchableOpacity>
            ))
          )}



        </View>
      </ScrollView>
      <FloatingActionButton buttons={floatingButtons} />
    </SafeAreaView>
  );
};

export default Clients;
