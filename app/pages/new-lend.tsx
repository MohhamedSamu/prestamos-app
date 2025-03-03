import React from "react";
import { useState } from "react";
import { Text, View, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import images from "../../constants/images";
import NumberField from "../../components/NumberField";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import ComboBox from "../../components/ComboBox";

interface Option
{
  value: string;
  placeholder?: string;
  legend?: string;
}

const options: Option[] = [
  {
    value: "quincena",
    placeholder: "Cada quincena",
  },
  {
    value: "mensual",
    placeholder: "Cada mes",
  },
];

const NewLend = () =>
{

  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    tasaInt: 0,
    cantidadPrestamo: 0,
    periodo: "quincena",
  });

  const submit = async () =>
  {
    if (
      (form.nombre === "") ||
      (form.periodo === "") ||
      !form.cantidadPrestamo
    )
    {
      return Alert.alert("Please provide all fields");
    }

    setUploading(true);
    try
    {
      //save it

      Alert.alert("Success", "Post uploaded successfully");
      router.push("/home");
    } catch (error: any)
    {
      Alert.alert("Error", error.message);
    } finally
    {
      setForm({
        nombre: "",
        tasaInt: 0,
        cantidadPrestamo: 0,
        periodo: "quincena",
      });

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
            Nuevo prestamo
          </Text>

          <FormField
            title="Nombre del cliente"
            value={form.nombre}
            placeholder="Roman Riquelme..."
            handleChangeText={(e) => setForm({ ...form, nombre: e })}
            otherStyles="mt-10"
          />

          <NumberField
            title="Tasa de interes (%)"
            value={form.tasaInt}
            placeholder="15%..."
            handleChangeText={(e) => setForm({ ...form, tasaInt: e })}
            otherStyles="mt-7"
          />

          <Text className="text-xl font-pregular text-gray-100 mb-2 mt-7">
            Periodo de amortizacion
          </Text>

          <ComboBox
            options={options}
            placeholder="Selecciona un periodo de tiempo"
            defaultOption={form.periodo}
            onSelect={(e) => setForm({ ...form, periodo: e.value })}
            containerStyles="w-full bg-blue-500"
            textStyles="text-white"
            isLoading={false}
          />

          <NumberField
            title="Cantidad de dinero a prestar"
            value={form.cantidadPrestamo}
            placeholder="800 ..."
            handleChangeText={(e) => setForm({ ...form, cantidadPrestamo: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Crear prestamo"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={uploading}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default NewLend