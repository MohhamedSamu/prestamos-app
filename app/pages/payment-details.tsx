import React, { useEffect, useState } from "react";
import { Text, View, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import images from "../../constants/images";
import { PaymentService } from "../../lib/PaymentService";
import { ClientsService } from "../../lib/ClientsService";
import { LendingService } from "../../lib/LendingService";
import { PaymentDocument, ClientDocument, LendingDocument } from "../../lib/types";
import { formatDateToSpanish } from "../../lib/utils/dateFormat";

const PaymentDetail = () => {
  const { paymentId } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentDocument | null>(null);
  const [client, setClient] = useState<ClientDocument | null>(null);
  const [lending, setLending] = useState<LendingDocument | null>(null);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [totalPaidCapital, setTotalPaidCapital] = useState<number>(0);

  const paymentService = new PaymentService();
  const clientsService = new ClientsService();
  const lendingService = new LendingService();

  useEffect(() => {
    if (paymentId) {
      loadPaymentDetails();
    }
  }, [paymentId]);

  const loadPaymentDetails = async () => {
    try {
      const paymentData = await paymentService.getPaymentById(paymentId as string);
      
      if (!paymentData) {
        Alert.alert("Error", "No se pudo cargar el pago");
        return;
      }
      
      setPayment(paymentData);
      
      // Load client information
      const clientData = await clientsService.getClientById(paymentData.cliente_id);
      setClient(clientData);
      
      // Load lending information
      const lendingData = await lendingService.getLendingById(paymentData.prestamo_id);
      setLending(lendingData);
      
      // Get all payments for this loan to calculate total paid
      if (lendingData) {
        const allPayments = await paymentService.getPaymentsByPrestamoId(lendingData.$id);
        
        if (allPayments) {
          const totalCapitalPaid = allPayments.reduce((sum, p) => sum + (p.cantidad_capital || 0), 0);
          setTotalPaidCapital(totalCapitalPaid);
          setRemainingAmount(lendingData.cantidad - totalCapitalPaid);
        }
      }
      
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la información del pago");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-xl">Cargando detalles del pago...</Text>
      </SafeAreaView>
    );
  }

  if (!payment) {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-xl">Pago no encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="mt-6 px-4 space-y-6 mb-6 pt-5">
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="font-pmedium text-sm text-gray-100">Detalle del pago</Text>
              <Text className="text-2xl font-psemibold text-white">💵 Información completa</Text>
            </View>
            <Image source={images.logoSmall} className="w-9 h-10" resizeMode="contain" />
          </View>

          <View className="space-y-4 bg-blue-800 p-4 rounded-2xl">
            <Text className="text-white text-lg font-psemibold">
              Cliente: {client ? client.nombre : 'Cargando...'}
            </Text>
            <Text className="text-white">Fecha de pago: {formatDateToSpanish(payment.fecha)}</Text>
            <Text className="text-white">Capital pagado: ${payment.cantidad_capital}</Text>
            <Text className="text-white">Interés pagado: ${payment.cantidad_interes}</Text>
            <Text className="text-white font-psemibold">Total pagado: ${payment.cantidad_capital + payment.cantidad_interes}</Text>
          </View>

          {lending && (
            <View className="space-y-4 bg-blue-700 p-4 rounded-2xl mt-4">
              <Text className="text-white text-lg font-psemibold">Detalles del préstamo</Text>
              <Text className="text-white">Monto total: ${lending.cantidad}</Text>
              <Text className="text-white">Tasa de interés: {lending.tasa_interes}%</Text>
              <Text className="text-white">Fecha de inicio: {formatDateToSpanish(lending.fecha_inicio)}</Text>
              
              {/* Calculate and show remaining amount to pay */}
              <View className="mt-2 pt-2 border-t border-blue-500">
                <Text className="text-white text-lg font-psemibold">Estado del préstamo</Text>
                <Text className="text-white">Total pagado hasta ahora: ${totalPaidCapital}</Text>
                <Text className="text-white">Capital restante por pagar: ${remainingAmount}</Text>
                <Text className="text-white">Progreso de pago: {Math.round((totalPaidCapital / lending.cantidad) * 100)}%</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentDetail; 