import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions, Image, Text, View, ScrollView } from "react-native";
import { StackedBarChart, PieChart } from "react-native-chart-kit";
import images from "../../constants/images";
import ComboBox from "../../components/ComboBox";
import FloatingActionButton from "../../components/FloatingActionButton";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const data = {
  labels: ["Diciembre", "Enero", "Febrero"],
  legend: ["Capital", "Interes"],
  data: [
    [3000, 300],
    [2000, 200],
    [1500, 150],
  ],
  barColors: ["#BF5050", "#6A86C1"],
};

const data2 = [
  {
    name: "Capital",
    quantity: 2000,
    color: "rgba(131, 167, 234, 1)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
  {
    name: "Interes",
    quantity: 200,
    color: "#F00",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  },
];

interface FloatingButtonConfig
{
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;  // Added label to provide tooltip text
  onPress: () => void;
}

interface Option
{
  value: string;
  placeholder?: string;
  legend?: string;
}

const options: Option[] = [
  {
    value: "mes",
    placeholder: "Ultimo mes",
    legend: "este mes",
  },
  {
    value: "3meses",
    placeholder: "Ultimos 3 meses",
    legend: "los ultimos 3",
  },
];

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
  const [datesToShow, setDatesToShow] = useState<Option>(options[0]);
  const [currentGraph, setCurrentGraph] = useState<JSX.Element | null>(null);

  const floatingButtons: FloatingButtonConfig[] = [
    { icon: "person-add", label: "Agregar cliente", onPress: () => router.push('/pages/create-client') },
    { icon: "payments", label: "Agregar pago", onPress: () => router.push('/pages/do-payment') },
    { icon: "rate-review", label: "Nueva deuda", onPress: () => router.push('/pages/new-lend') },
  ];

  useEffect(() =>
  {
    setCurrentGraph(renderGraph(datesToShow.value));
  }, [datesToShow]);

  const handleSelect = (selectedOption: Option) =>
  {
    setDatesToShow(selectedOption);
  };

  const dataClients = Array.from({ length: 10 }, (_, index) => ({
    id: index.toString(),
    title: `Juan Carlos ${index + 1}`,
  }));

  const renderGraph = (value: string) =>
  {
    if (value === "3meses")
    {
      return (
        <View>
          <StackedBarChart
            width={Dimensions.get("window").width - 30}
            height={400}
            data={data}
            hideLegend={true}
            withVerticalLabels={false}
            chartConfig={chartConfig}
            style={{ left: 10 }}
          />

          <Text className="text-2xl text-center font-pregular text-gray-100 mb-3">
            Lista de clientes que no han pagado
          </Text>

          {/* Mapping through the data and rendering it inside ScrollView */}
          {dataClients.map((item) => (
            <View key={item.id} className="my-2">
              <Text className="text-xl font-psemibold text-white">{item.title}</Text>
            </View>
          ))}
        </View>
      );
    } else
    {
      return (
        <View>
          <PieChart
            hasLegend={false}
            data={data2}
            width={Dimensions.get("window").width}
            height={400}
            chartConfig={chartConfig}
            accessor={"quantity"}
            backgroundColor={"transparent"}
            paddingLeft={"0"}
            center={[95, 0]}
            absolute
          />
          <Text className="text-lg font-pregular text-gray-100 mb-3">
            Color rojo es interes
          </Text>
          <Text className="text-lg font-pregular text-gray-100 mb-3">
            Color azul es capital
          </Text>

          <Text className="text-2xl text-center font-pregular text-gray-100 mb-3">
            Lista de clientes que no han pagado
          </Text>

          {/* Mapping through the data and rendering it inside ScrollView */}
          {dataClients.map((item) => (
            <View key={item.id} className="my-2">
              <Text className="text-xl font-psemibold text-white">{item.title}</Text>
            </View>
          ))}
        </View>
      );
    }
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
            <View className="mt-1.5">
              <Image source={images.logoSmall} className="w-9 h-10" resizeMode="contain" />
            </View>
          </View>

          <ComboBox
            options={options}
            placeholder="Selecciona un periodo de tiempo"
            defaultOption={datesToShow.value}
            onSelect={handleSelect}
            containerStyles="w-full mb-5 bg-blue-500"
            textStyles="text-white"
            isLoading={false}
          />

          <Text className="text-lg font-pregular text-gray-100 mb-3">
            Resumen de {datesToShow?.legend}
          </Text>

          {currentGraph}
        </View>
      </ScrollView>
      <FloatingActionButton buttons={floatingButtons} />
    </SafeAreaView>

  );
};

export default Home;
