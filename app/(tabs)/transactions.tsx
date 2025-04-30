import React, { useCallback, useEffect, useState } from "react";
import { Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import FloatingActionButton from "../../components/FloatingActionButton";
import images from "../../constants/images";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from 'expo-router';
import { PaymentService } from "../../lib/PaymentService";
import { ClientsService } from "../../lib/ClientsService";
import { PaymentDocument, ClientDocument } from "../../lib/types";
import { formatDateToSpanish } from "../../lib/utils/dateFormat";

interface FloatingButtonConfig {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;  // Added label to provide tooltip text
  onPress: () => void;
}

interface PaymentWithClient extends PaymentDocument {
  clientName?: string;
}

const Transactions = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentWithClient[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<string, ClientDocument>>({});

  const paymentService = new PaymentService();
  const clientsService = new ClientsService();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      // Load all payments
      const paymentData = await paymentService.getAllPatments();
      
      if (paymentData) {
        // Sort payments by date (most recent first)
        const sortedPayments = [...paymentData].sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        setPayments(sortedPayments);
        
        // Get all unique client IDs
        const clientIds = [...new Set(paymentData.map(p => p.cliente_id))];
        
        // Load client details
        const clients = await clientsService.getAllClients();
        if (clients) {
          const clientMap: Record<string, ClientDocument> = {};
          clients.forEach(client => {
            clientMap[client.$id] = client;
          });
          setClientsMap(clientMap);
        }
      }
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const floatingButtons: FloatingButtonConfig[] = [
    { icon: "person-add", label:"Agregar cliente", onPress: () => router.push('/pages/create-client') },
    { icon: "payments", label:"Agregar pago", onPress: () => router.push('/pages/do-payment') },
    { icon: "rate-review", label:"Nueva deuda", onPress: () => router.push('/pages/new-lend') },
  ];

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
            Lista de transacciones
          </Text>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text className="text-white mt-4">Cargando transacciones...</Text>
            </View>
          ) : payments.length === 0 ? (
            <Text className="text-lg text-center font-pregular text-gray-400 py-10">
              No hay transacciones registradas.
            </Text>
          ) : (
            payments.map((payment) => (
              <TouchableOpacity
                key={payment.$id}
                className="my-2"
                onPress={() => router.push({
                  pathname: "/pages/payment-details",
                  params: { paymentId: payment.$id }
                })}
              >
                <View className="p-3 bg-blue-700 rounded-xl">
                  <Text className="text-white font-psemibold text-lg">
                    💰 ${payment.cantidad_capital + payment.cantidad_interes}
                  </Text>
                  <Text className="text-white text-sm">
                    Cliente: {clientsMap[payment.cliente_id]?.nombre || "Cliente desconocido"}
                  </Text>
                  <Text className="text-white text-sm">
                    Fecha: {formatDateToSpanish(payment.fecha)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      <FloatingActionButton buttons={floatingButtons} />
    </SafeAreaView>
  );
};

export default Transactions;