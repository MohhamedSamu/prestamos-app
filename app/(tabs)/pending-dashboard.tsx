import React, { useCallback, useState } from "react";
import { Text, View, Image, ScrollView, ActivityIndicator } from "react-native";
import FloatingActionButton from "../../components/FloatingActionButton";
import images from "../../constants/images";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from 'expo-router';
import { PaymentService } from "../../lib/PaymentService";
import { ClientsService } from "../../lib/ClientsService";
import { LendingService } from "../../lib/LendingService";
import { ClientDocument, LendingDocument } from "../../lib/types";
import ComboBox from "../../components/ComboBox";

interface FloatingButtonConfig {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
}

interface ClientSummary {
  client: ClientDocument;
  lending: LendingDocument;
  pendingInterest: number;
  remainingCapital: number;
  isOverdue: boolean;
  lastPaymentDate?: string;
}

interface Option {
  value: string;
  placeholder: string;
}

const filterOptions: Option[] = [
  {
    value: "pending",
    placeholder: "Intereses pendientes",
  },
  {
    value: "overdue",
    placeholder: "En mora",
  }
];

// Define a non-null value for the default option
const defaultFilter = filterOptions[0];

const PendingDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<Option>({
    value: "pending",
    placeholder: "Intereses pendientes",
  });
  const [clientSummaries, setClientSummaries] = useState<ClientSummary[]>([]);

  const paymentService = new PaymentService();
  const clientsService = new ClientsService();
  const lendingService = new LendingService();

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedFilter])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Step 1: Get all clients in a single query
      const clients = await clientsService.getAllClients();
      if (!clients || clients.length === 0) return;
      
      console.log("Clients loaded:", clients.length);
      
      // Create a map of clients for quick lookup
      const clientMap = new Map(clients.map(client => [client.$id, client]));
      
      // Step 2: Get ALL active lendings in a single query
      const allActiveLendings = await lendingService.getAllActiveLendings();
      if (!allActiveLendings || allActiveLendings.length === 0) return;
      
      console.log("Active lendings loaded:", allActiveLendings.length);
      
      const summaries: ClientSummary[] = [];
      
      // Process each active lending and calculate interest
      for (const lending of allActiveLendings) {
        const client = clientMap.get(lending.cliente_id);
        if (!client || !client.periodo) continue;

        try {
          // Use the existing service method for accurate calculation
          const loanInfo = await paymentService.calculateInterestForLending(
            lending.$id,
            client.periodo as "mensual" | "quincenal" | "catorcenal"
          );
          
          // Get the last payment date
          const lastPaymentDate = loanInfo.lastPaymentDate;
          
          // Calculate if the loan is overdue based on the client's period
          let isOverdue = false;
          if (lastPaymentDate) {
            const today = new Date();
            const lastPaymentTime = new Date(lastPaymentDate);
            const diffTime = Math.abs(today.getTime() - lastPaymentTime.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Check if past the capitalization time
            switch (client.periodo) {
              case "mensual":
                isOverdue = diffDays > 31;
                break;
              case "quincenal":
                isOverdue = diffDays > 16;
                break;
              case "catorcenal":
                isOverdue = diffDays > 15;
                break;
            }
          } else {
            // If no payments have been made, check against loan start date
            const loanStartDate = new Date(lending.fecha_inicio);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - loanStartDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            switch (client.periodo) {
              case "mensual":
                isOverdue = diffDays > 31;
                break;
              case "quincenal":
                isOverdue = diffDays > 16;
                break;
              case "catorcenal":
                isOverdue = diffDays > 15;
                break;
            }
          }
          
          console.log(`${client.nombre} interest: ${loanInfo.interest}, remaining: ${loanInfo.remainingCapital}, overdue: ${isOverdue}`);
          
          const summary: ClientSummary = {
            client,
            lending,
            pendingInterest: loanInfo.interest,
            remainingCapital: loanInfo.remainingCapital,
            isOverdue,
            lastPaymentDate
          };
          
          // Only add to summaries if it matches the current filter
          if (
            (selectedFilter.value === "pending" && loanInfo.interest > 0) ||
            (selectedFilter.value === "overdue" && isOverdue)
          ) {
            summaries.push(summary);
          }
        } catch (error) {
          console.error(`Error calculating for ${client.nombre}, lending ${lending.$id}:`, error);
        }
      }
      
      console.log(`Found ${summaries.length} entries matching filter ${selectedFilter.value}`);
      setClientSummaries(summaries);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const floatingButtons: FloatingButtonConfig[] = [
    { icon: "person-add", label: "Agregar cliente", onPress: () => router.push('/pages/create-client') },
    { icon: "payments", label: "Agregar pago", onPress: () => router.push('/pages/do-payment') },
    { icon: "rate-review", label: "Nueva deuda", onPress: () => router.push('/pages/new-lend') },
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

          <ComboBox
            options={filterOptions}
            placeholder="Selecciona un filtro"
            defaultOption={selectedFilter.value}
            onSelect={(option) => {
              setSelectedFilter(option as Option);
            }}
            containerStyles="w-full mb-5 bg-blue-500"
            textStyles="text-white"
            isLoading={loading}
          />

          <Text className="text-2xl text-center font-pregular text-gray-100 mb-3">
            {selectedFilter.value === "pending" ? 'Intereses pendientes' : 'Clientes en mora'}
          </Text>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text className="text-white mt-4">Cargando información...</Text>
            </View>
          ) : clientSummaries.length === 0 ? (
            <Text className="text-lg text-center font-pregular text-gray-400 py-10">
              No hay {selectedFilter.value === "pending" ? 'intereses pendientes' : 'clientes en mora'}.
            </Text>
          ) : (
            clientSummaries.map((summary) => (
              <View
                key={summary.lending.$id}
                className="p-4 bg-blue-800 rounded-xl mb-4"
              >
                <Text className="text-white font-psemibold text-lg mb-2">
                  {summary.client.nombre}
                </Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300">Interés pendiente:</Text>
                    <Text className="text-red-500 font-psemibold">
                      ${summary.pendingInterest.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-300">Capital restante:</Text>
                    <Text className="text-white">
                      ${summary.remainingCapital.toFixed(2)}
                    </Text>
                  </View>
                  {summary.lastPaymentDate && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-300">Último pago:</Text>
                      <Text className="text-gray-300">
                        {new Date(summary.lastPaymentDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <FloatingActionButton buttons={floatingButtons} />
    </SafeAreaView>
  );
};

export default PendingDashboard; 