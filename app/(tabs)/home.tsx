import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions, Image, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { PieChart } from "react-native-chart-kit";
import images from "../../constants/images";
import ComboBox from "../../components/ComboBox";
import FloatingActionButton from "../../components/FloatingActionButton";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { DashboardService, Period, ClientSummary } from "../../lib/DashboardService";
import { formatDateToSpanish } from "../../lib/utils/dateFormat";

interface FloatingButtonConfig
{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;  // Added label to provide tooltip text
  onPress: () => void;
}

interface Option {
  value: Period;
  placeholder: string;
  legend?: string;
}

const chartOptions: Option[] = [
  {
    value: "mes_actual",
    placeholder: "Mes actual",
    legend: "este mes",
  },
  {
    value: "30dias",
    placeholder: "Últimos 30 días",
    legend: "los últimos 30 días",
  },
  {
    value: "3meses",
    placeholder: "Últimos 3 meses",
    legend: "los últimos 3 meses",
  },
  {
    value: "6meses",
    placeholder: "Últimos 6 meses",
    legend: "los últimos 6 meses",
  },
  {
    value: "ano_actual",
    placeholder: "Año actual",
    legend: "este año",
  },
  {
    value: "ano_anterior",
    placeholder: "Año anterior",
    legend: "el año anterior",
  }
] as const;

// Define a guaranteed non-nullable default option
const defaultOption = {
  value: "mes_actual" as const,
  placeholder: "Mes actual",
  legend: "este mes",
};

const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, // optional, default 3
};

const Home = () =>
{
  const [datesToShow, setDatesToShow] = useState<Option>(defaultOption);
  const [dashboardData, setDashboardData] = useState<{ 
    pieChartData: any[],
    clientSummaries: ClientSummary[]
  }>({ pieChartData: [], clientSummaries: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasData, setHasData] = useState<boolean>(false);

  const dashboardService = new DashboardService();

  const floatingButtons: FloatingButtonConfig[] = [
    { icon: "person-add", label: "Agregar cliente", onPress: () => router.push('/pages/create-client') },
    { icon: "payments", label: "Agregar pago", onPress: () => router.push('/pages/do-payment') },
    { icon: "rate-review", label: "Nueva deuda", onPress: () => router.push('/pages/new-lend') },
  ];

  useFocusEffect(
    useCallback(() => {
      if (datesToShow) {
        loadDashboardData();
      }
    }, [datesToShow])
  );

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getChartData(datesToShow.value);
      setDashboardData(data);
      
      // Check if there's any meaningful data to display
      const totalAmount = data.pieChartData.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setHasData(totalAmount > 0);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const renderGraph = () => {
    if (!hasData) {
      return (
        <View className="items-center justify-center py-10">
          <Text className="text-white text-lg">No hay datos disponibles para este período.</Text>
        </View>
      );
    }
    
    // Safe-check the data for pie chart
    const chartData = dashboardData.pieChartData.map(item => ({
      name: item.name || "",
      quantity: typeof item.quantity === 'number' ? item.quantity : 0,
      color: item.color || "#cccccc",
      legendFontColor: item.legendFontColor || "#7F7F7F",
      legendFontSize: item.legendFontSize || 15,
    }));
    
    // Calculate totals for display
    const totalCapital = chartData[0]?.quantity || 0;
    const totalInterest = chartData[1]?.quantity || 0;
    const total = totalCapital + totalInterest;
    
    // Format percentages
    const capitalPercent = total > 0 ? Math.round((totalCapital / total) * 100) : 0;
    const interestPercent = total > 0 ? Math.round((totalInterest / total) * 100) : 0;
    
    return (
      <View>
        <PieChart
          hasLegend={false}
          data={chartData}
          width={Dimensions.get("window").width}
          height={400}
          chartConfig={chartConfig}
          accessor={"quantity"}
          backgroundColor={"transparent"}
          paddingLeft={"0"}
          center={[95, 0]}
          absolute
        />
        
        <View className="flex-row justify-between items-center mt-4 mb-6">
          <View className="flex-row items-center">
            <View className="w-4 h-4 mr-2 bg-[rgba(131,167,234,1)]" />
            <Text className="text-white">Capital: ${totalCapital.toFixed(2)} ({capitalPercent}%)</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 mr-2 bg-[#F00]" />
            <Text className="text-white">Interés: ${totalInterest.toFixed(2)} ({interestPercent}%)</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderClientSummaries = () => {
    if (dashboardData.clientSummaries.length === 0 || !hasData) {
      return (
        <View className="items-center justify-center py-5">
          <Text className="text-white text-lg">No hay pagos de clientes en este período.</Text>
        </View>
      );
    }

    return (
      <View>
        {dashboardData.clientSummaries.map((client) => (
          <View key={client.id} className="bg-blue-800 rounded-xl p-4 mb-3">
            <Text className="text-xl font-psemibold text-white">{client.name}</Text>
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-300">Capital: ${client.capitalPaid.toFixed(2)}</Text>
              <Text className="text-gray-300">Interés: ${client.interestPaid.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-white font-psemibold">Total: ${client.totalPaid.toFixed(2)}</Text>
              <Text className="text-gray-300 text-xs mt-1">
                Último pago: {formatDateToSpanish(client.lastPaymentDate)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mt-6 px-4 space-y-6 mb-6 pb-20 pt-5 flex-1">
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="font-pmedium text-sm text-gray-100">
                Bienvenido de regreso
              </Text>
              <Text className="text-2xl font-psemibold text-white">
                A tu control
              </Text>
            </View>
            <View className="mt-1.5 flex-row items-center gap-3">
              <Image source={images.logoSmall} className="w-9 h-10" resizeMode="contain" />
            </View>
          </View>

          <ComboBox
            options={chartOptions}
            placeholder="Selecciona un periodo de tiempo"
            defaultOption={datesToShow.value}
            onSelect={(option) => {
              setDatesToShow(option as Option);
            }}
            containerStyles="w-full mb-5 bg-blue-500"
            textStyles="text-white"
            isLoading={isLoading}
          />

          <Text className="text-lg font-pregular text-gray-100 mb-3">
            Resumen de {datesToShow.legend || ""}
          </Text>

          {isLoading ? (
            <View className="items-center justify-center h-96">
              <ActivityIndicator size="large" color="#6A86C1" />
              <Text className="text-white mt-4">Cargando datos...</Text>
            </View>
          ) : (
            <>
              {renderGraph()}
              
              <Text className="text-2xl text-center font-pregular text-gray-100 my-5">
                Resumen de pagos recibidos
              </Text>
              
              {renderClientSummaries()}
            </>
          )}
        </View>
      </ScrollView>
      <FloatingActionButton buttons={floatingButtons} />
    </SafeAreaView>
  );
};

export default Home;
