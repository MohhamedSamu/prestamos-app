import React, { useEffect, useState } from "react";
import { Text, View, Image, ScrollView, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import images from "../../constants/images";
import { LendingService } from "../../lib/LendingService";
import { PaymentService } from "../../lib/PaymentService";
import { LendingDocument } from "../../lib/types";
import { PaymentDocument } from "../../lib/types";
import { formatDateToSpanish } from "../../lib/utils/dateFormat";

interface PaymentSummary {
  totalCapitalPaid: number;
  totalInterestPaid: number;
  totalPaid: number;
  remainingCapital: number;
  completionPercentage: number;
  isCompleted: boolean;
}

const LendDetail = () =>
{
  const { lendingId, clientPeriod } = useLocalSearchParams();

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestToDate, setInterestToDate] = useState(0);
  const [lending, setLending] = useState<LendingDocument | null>(null);
  const [payments, setPayments] = useState<PaymentDocument[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    totalCapitalPaid: 0,
    totalInterestPaid: 0,
    totalPaid: 0,
    remainingCapital: 0,
    completionPercentage: 0,
    isCompleted: false
  });
  
  const lendingService = new LendingService();
  const paymentService = new PaymentService();

  useEffect(() =>
  {
    if (lendingId)
    {
      loadLending();
    } else
    {
      setError("No se proporcionó ID del préstamo");
      setLoading(false);
    }
  }, [lendingId]);

  const loadLending = async () =>
  {
    try
    {
      console.log("Loading lending with ID:", lendingId);
      
      if (!lendingId)
      {
        setError("ID de préstamo inválido");
        setLoading(false);
        return;
      }

      const lendingData = await lendingService.getLendingById(lendingId as string);
      console.log("Lending data received:", JSON.stringify(lendingData));
      
      if (!lendingData)
      {
        console.log("No lending data found");
        setError("No se pudo encontrar el préstamo");
        setLoading(false);
        return;
      }

      setLending(lendingData);
      
      const paymentData = await paymentService.getPaymentsByPrestamoId(lendingId as string);
      console.log("Payment data received:", JSON.stringify(paymentData || []));
      
      const safePayments = paymentData || [];
      setPayments(safePayments);

      // Sort payments by date (most recent first)
      safePayments.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      const lastPaymentDate =
        safePayments.length > 0 && safePayments[0]?.fecha
          ? safePayments[0].fecha
          : lendingData.fecha_inicio;

      const totalCapitalPaid = safePayments.reduce(
        (sum, p) => sum + (Number(p.cantidad_capital) || 0),
        0
      );
      
      const totalInterestPaid = safePayments.reduce(
        (sum, p) => sum + (Number(p.cantidad_interes) || 0),
        0
      );

      const remainingCapital = lendingData.cantidad - totalCapitalPaid;
      const isCompleted = !!lendingData.fecha_fin || remainingCapital <= 0;
      const completionPercentage = Math.min(
        100, 
        Math.round((totalCapitalPaid / lendingData.cantidad) * 100)
      );

      setPaymentSummary({
        totalCapitalPaid,
        totalInterestPaid,
        totalPaid: totalCapitalPaid + totalInterestPaid,
        remainingCapital: Math.max(0, remainingCapital),
        completionPercentage,
        isCompleted
      });

      if (!isCompleted) {
        try
        {
          const interest = lendingService.calculateInterestUntilToday({
            capital: remainingCapital,
            tasa_interes: lendingData.tasa_interes,
            lastPaymentDate,
            period: clientPeriod as "mensual" | "quincenal" | "catorcenal",
          });
          setInterestToDate(interest);
        } catch (interestError)
        {
          console.error("Error calculating interest:", interestError);
          setInterestToDate(0);
        }
      } else {
        setInterestToDate(0);
      }

    } catch (error)
    {
      console.error("Error in loadLending:", error);
      setError("Error al cargar el préstamo");
    } finally
    {
      setLoading(false);
    }
  };

  const renderProgressBar = (percentage: number) => {
    return (
      <View className="h-4 bg-gray-700 rounded-full mt-2 mb-3 overflow-hidden">
        <View 
          className="h-full bg-green-500 rounded-full" 
          style={{ width: `${percentage}%` }} 
        />
      </View>
    );
  };

  if (loading)
  {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-xl">Cargando préstamo...</Text>
      </SafeAreaView>
    );
  }

  if (error)
  {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-xl">{error}</Text>
        <TouchableOpacity 
          className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
          onPress={() => router.back()}>
          <Text className="text-white">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!lending)
  {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-xl">Préstamo no encontrado.</Text>
        <TouchableOpacity 
          className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
          onPress={() => router.back()}>
          <Text className="text-white">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="mt-6 px-4 space-y-6 mb-6 pt-5">
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="font-pmedium text-sm text-gray-100">Detalle del préstamo</Text>
              <Text className="text-2xl font-psemibold text-white">💵 Información completa</Text>
            </View>
            <Image source={images.logoSmall} className="w-9 h-10" resizeMode="contain" />
          </View>

          <View className="space-y-4 bg-blue-800 p-4 rounded-2xl">
            <Text className="text-white text-lg font-psemibold">Cantidad prestada: ${lending.cantidad.toFixed(2)}</Text>
            <Text className="text-white">Interés: {lending.tasa_interes}%</Text>
            <Text className="text-white">Periodo: {clientPeriod}</Text>
            <Text className="text-white">Fecha de inicio: {formatDateToSpanish(lending.fecha_inicio)}</Text>
            {lending.fecha_fin && (
              <Text className="text-white">Fecha de finalización: {formatDateToSpanish(lending.fecha_fin)}</Text>
            )}
            {!paymentSummary.isCompleted && (
              <Text className="text-white">Interés actual: <Text className="text-red-500 font-bold">${interestToDate.toFixed(2)}</Text></Text>
            )}
          </View>

          <View className="space-y-2 bg-blue-900 p-4 rounded-2xl mt-4">
            <Text className="text-white text-lg font-psemibold">Resumen de pagos</Text>
            
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-300">Capital pagado:</Text>
              <Text className="text-white font-psemibold">${paymentSummary.totalCapitalPaid.toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-300">Interés pagado:</Text>
              <Text className="text-white font-psemibold">${paymentSummary.totalInterestPaid.toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-300">Total pagado:</Text>
              <Text className="text-white font-psemibold">${paymentSummary.totalPaid.toFixed(2)}</Text>
            </View>
            
            {!paymentSummary.isCompleted && (
              <View className="flex-row justify-between">
                <Text className="text-gray-300">Capital pendiente:</Text>
                <Text className="text-white font-psemibold">${paymentSummary.remainingCapital.toFixed(2)}</Text>
              </View>
            )}
            
            <Text className="text-white mt-3">
              Progreso: {paymentSummary.completionPercentage}% {paymentSummary.isCompleted ? "(Completado)" : ""}
            </Text>
            
            {renderProgressBar(paymentSummary.completionPercentage)}
          </View>

          <Text className="text-2xl text-center font-pregular text-gray-100 mb-3 mt-6">
            Pagos realizados
          </Text>

          {payments.length === 0 ? (
            <Text className="text-lg text-center font-pregular text-gray-400">
              No hay pagos aún.
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
                  <Text className="text-white font-psemibold text-lg">💰 ${(Number(payment.cantidad_capital) + Number(payment.cantidad_interes)).toFixed(2)}</Text>
                  <Text className="text-white font-psemibold text-sm">Capital: ${Number(payment.cantidad_capital).toFixed(2)}</Text>
                  <Text className="text-white font-psemibold text-sm">Interés: ${Number(payment.cantidad_interes).toFixed(2)}</Text>
                  <Text className="text-white font-psemibold text-sm mt-1">Fecha: {formatDateToSpanish(payment.fecha)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LendDetail;
