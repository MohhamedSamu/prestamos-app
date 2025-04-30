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

import { ClientsService } from "../../lib/ClientsService";
import { NewClient } from "../../lib/types"; 

interface Option {
  value: string;
  placeholder: string;
  legend?: string;
}

const options: Option[] = [
  {
    value: "quincenal",
    placeholder: "Cada quincena",
  },
  {
    value: "mensual",
    placeholder: "Cada mes",
  },
  {
    value: "catorcenal",
    placeholder: "Cada 14 días",
  }
];

const CreateClient = () =>
{
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<NewClient>({
    nombre: "",
    domicilio: "",
    numero: "",
    tasa_interes: 0,
    cantidadPrestamo: 0,
    periodo: "quincenal",
  });
  const clientService = new ClientsService();

  const submit = async () =>
  {
    if (
      (form.domicilio === "") ||
      (form.nombre === "") ||
      (form.numero === "") ||
      (form.periodo === "") ||
      !form.cantidadPrestamo
    )
    {
      return Alert.alert("Please provide all fields");
    }

    setUploading(true);
    try
    {
      const data = await clientService.insertClientWithLending(form);

      Alert.alert("Exito", "Cliente creado correctamente");
      router.push("/home");
    } catch (error: any)
    {
      Alert.alert("Error", error.message);
    } finally
    {
      setForm({
        nombre: "",
        domicilio: "",
        numero: "",
        periodo: "quincenal",
        tasa_interes: 0,
        cantidadPrestamo: 0,
      });

      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }}>
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
            Agregar cliente nuevo
          </Text>

          <FormField
            title="Nombre del cliente"
            value={form.nombre}
            placeholder="Roman Riquelme..."
            handleChangeText={(e) => setForm({ ...form, nombre: e })}
            otherStyles="mt-10"
          />

          <FormField
            title="Domicilio"
            value={form.domicilio}
            placeholder="Colonia, ciudad, casa..."
            handleChangeText={(e) => setForm({ ...form, domicilio: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Numero de telefono"
            value={form.numero}
            placeholder="7789 5151 ..."
            handleChangeText={(e) => setForm({ ...form, numero: e })}
            otherStyles="mt-7"
          />

          <NumberField
            title="Tasa de interes (%)"
            value={form.tasa_interes}
            placeholder="15%..."
            handleChangeText={(e) => setForm({ ...form, tasa_interes: e })}
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
            title="Crear cliente"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={uploading}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default CreateClient