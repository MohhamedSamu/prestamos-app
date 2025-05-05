import React, { useEffect, useState } from "react";
import { Text, View, Image, ScrollView, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import images from "../../constants/images";
import NumberField from "../../components/NumberField";
import CustomButton from "../../components/CustomButton";
import ClientsAutocompleteInput from "../../components/ClientsAutocompleteInput";
import LendingsAutocompleteInput from "../../components/LendingsAutocompleteInput";
import { ClientDocument, LendingDocument } from "../../lib/types";
import { PaymentService } from "../../lib/PaymentService";
import { periodToDays } from "../../lib/LendingService";

const DoPayment = () => {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDocument | null>(null);
  const [selectedLending, setSelectedLending] = useState<LendingDocument | null>(null);
  const [interestToPay, setInterestToPay] = useState(0);
  const [capitalToPay, setCapitalToPay] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [remainingCapital, setRemainingCapital] = useState(0);
  const [isFullPayment, setIsFullPayment] = useState(false);
  const [showLoanInfo, setShowLoanInfo] = useState(false);
  
  const paymentService = new PaymentService();

  useEffect(() => {
    if (selectedLending) {
      loadLoanInfo();
    } else {
      resetPaymentInfo();
    }
  }, [selectedLending]);

  useEffect(() => {
    if (isFullPayment && remainingCapital > 0) {
      // For full payment, set the total payment to include all remaining capital plus interest
      const fullPayment = remainingCapital + interestToPay;
      setTotalPayment(fullPayment);
      setCapitalToPay(remainingCapital);
    }
  }, [isFullPayment, remainingCapital, interestToPay]);

  useEffect(() => {
    // Calculate capital to pay when total payment changes
    if (!isFullPayment && totalPayment > 0) {
      const calculatedCapital = Math.max(0, totalPayment - interestToPay);
      
      // If calculated capital exceeds remaining capital, adjust it
      if (calculatedCapital > remainingCapital) {
        setCapitalToPay(remainingCapital);
        // Adjust total payment to match the max possible (remaining capital + interest)
        setTotalPayment(remainingCapital + interestToPay);
      } else {
        setCapitalToPay(calculatedCapital);
      }
    }
  }, [totalPayment, interestToPay, isFullPayment, remainingCapital]);

  const resetPaymentInfo = () => {
    setInterestToPay(0);
    setCapitalToPay(0);
    setTotalPayment(0);
    setRemainingCapital(0);
    setShowLoanInfo(false);
  };

  const loadLoanInfo = async () => {
    if (!selectedClient || !selectedLending) return;
    
    setLoading(true);
    try {
      console.log("Client period for interest calculation:", selectedClient.periodo);
      
      const loanInfo = await paymentService.calculateInterestForLending(
        selectedLending.$id,
        selectedClient.periodo as keyof typeof periodToDays
      );
      
      setInterestToPay(loanInfo.interest);
      setRemainingCapital(loanInfo.remainingCapital);
      setShowLoanInfo(true);
      
      // Initialize total payment with interest amount
      setTotalPayment(loanInfo.interest);
      setCapitalToPay(0);
    } catch (error) {
      console.error("Error loading loan info:", error);
      Alert.alert("Error", "No se pudo cargar la información del préstamo");
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (client: ClientDocument) => {
    setSelectedClient(client);
    setSelectedLending(null);
    resetPaymentInfo();
  };

  const handleLendingSelect = (lending: LendingDocument) => {
    setSelectedLending(lending);
  };
  
  const handleTotalPaymentChange = (value: number) => {
    setTotalPayment(value);
  };

  const submit = async () => {
    if (!selectedClient || !selectedLending) {
      return Alert.alert("Error", "Selecciona un cliente y un préstamo");
    }

    if (totalPayment <= 0) {
      return Alert.alert("Error", "Ingresa una cantidad para pagar");
    }

    if (capitalToPay > remainingCapital) {
      return Alert.alert("Error", "El capital a pagar no puede ser mayor que el restante");
    }

    // Ensure interest is paid first
    if (totalPayment < interestToPay) {
      return Alert.alert("Error", "El pago debe cubrir al menos el interés acumulado ($" + interestToPay.toFixed(2) + ")");
    }

    setUploading(true);
    try {
      const now = new Date();
      
      const paymentData = {
        cliente_id: selectedClient.$id,
        prestamo_id: selectedLending.$id,
        cantidad_interes: interestToPay,
        cantidad_capital: capitalToPay,
        fecha: now.toISOString()
      };

      const result = await paymentService.insertPayment(paymentData);

      if (!result) {
        throw new Error("Error al crear el pago");
      }

      // If this is a full payment, mark the loan as completed
      if (isFullPayment || (capitalToPay === remainingCapital && capitalToPay > 0)) {
        await paymentService.markLendingAsCompleted(selectedLending.$id);
      }

      Alert.alert(
        "Éxito", 
        "Pago registrado correctamente", 
        [{ text: "OK", onPress: () => router.push("/pages/payment-details?paymentId=" + result.$id) }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Hubo un error al crear el pago");
    } finally {
      setSelectedClient(null);
      setSelectedLending(null);
      resetPaymentInfo();
      setIsFullPayment(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
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
            Recibir pago
          </Text>

          <ClientsAutocompleteInput
            onSelect={handleClientSelect}
            otherStyles="mt-10"
          />

          <LendingsAutocompleteInput
            clientId={selectedClient?.$id || ""}
            onSelect={handleLendingSelect}
            otherStyles="mt-7"
          />

          {loading && (
            <Text className="text-lg text-center font-pregular text-gray-400 mt-4">
              Cargando información del préstamo...
            </Text>
          )}

          {showLoanInfo && !loading && (
            <>
              <View className="space-y-4 bg-blue-800 p-4 rounded-2xl mt-4">
                <Text className="text-white text-lg font-psemibold">Detalles de pago</Text>
                <Text className="text-white">Capital pendiente: ${remainingCapital.toFixed(2)}</Text>
                <Text className="text-white">Intereses acumulados: ${interestToPay.toFixed(2)}</Text>
                <Text className="text-white">Total a pagar: ${(interestToPay + remainingCapital).toFixed(2)}</Text>
              </View>

              <View className="flex-row items-center justify-between mt-6">
                <Text className="text-base text-gray-100 font-pmedium">Pago completo del préstamo</Text>
                <Switch
                  trackColor={{ false: "#2C2C2E", true: "#3B82F6" }}
                  thumbColor={isFullPayment ? "#FFFFFF" : "#f4f3f4"}
                  onValueChange={() => setIsFullPayment(!isFullPayment)}
                  value={isFullPayment}
                />
              </View>

              {!isFullPayment && (
                <NumberField
                  title="Cantidad total a pagar"
                  value={totalPayment}
                  placeholder="200..."
                  handleChangeText={(value) => handleTotalPaymentChange(value)}
                  otherStyles="mt-4"
                />
              )}

              <View className="space-y-4 bg-blue-900 p-4 rounded-2xl mt-6">
                <Text className="text-white text-lg font-psemibold">Distribución del pago</Text>
                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Interés a pagar:</Text>
                  <Text className="text-red-500 font-psemibold">${interestToPay.toFixed(2)}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Capital a pagar:</Text>
                  <Text className="text-green-500 font-psemibold">${capitalToPay.toFixed(2)}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-300">Total a pagar:</Text>
                  <Text className="text-white font-psemibold">${totalPayment.toFixed(2)}</Text>
                </View>
              </View>

              <CustomButton
                title="Registrar pago"
                handlePress={submit}
                containerStyles="mt-7"
                isLoading={uploading}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoPayment;