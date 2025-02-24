import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions, Image, Text, View, ScrollView } from "react-native";
import { StackedBarChart, PieChart } from "react-native-chart-kit";
import images from "../../constants/images";
import ComboBox from "../../components/ComboBox";

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

interface Option {
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

const Home = () => {
  const [datesToShow, setDatesToShow] = useState<Option>(options[0]);
  const [currentGraph, setCurrentGraph] = useState<JSX.Element | null>(null);

  useEffect(() => {
    setCurrentGraph(renderGraph(datesToShow.value));
  }, [datesToShow]);

  const handleSelect = (selectedOption: Option) => {
    setDatesToShow(selectedOption);
  };
  

  const renderGraph = (value: string) => {
    if (value === "3meses") {
      return (
        <View className="w-full h-full flex-1 pt-1 pb-8">
          <StackedBarChart
            width={Dimensions.get("window").width - 30}
            height={400}
            data={data}
            hideLegend={true}
            withVerticalLabels={false}
            chartConfig={chartConfig}
            style={{ left: 10 }}
          />
        </View>
      );
    } else {
      return (
        <View className="w-full h-full flex-1 pt-1 pb-8">
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
        </View>
      );
    }
  };

  return (
    <SafeAreaView className="bg-primary">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex mt-6 px-4 space-y-6">
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
    </SafeAreaView>
  );
};

export default Home;
