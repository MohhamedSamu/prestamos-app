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
import ClientsAutocompleteInput from "../../components/ClientsAutocompleteInput";
import { ClientDocument } from "lib/types";
import { LendingService } from "../../lib/LendingService";


interface Option
{
  value: string;
  placeholder?: string;
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

const NewLend = () =>
{

  const [uploading, setUploading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDocument | null>(null);

  const [form, setForm] = useState({
    nombre: "",
    idCliente: "",
    tasaInt: 0,
    cantidadPrestamo: 0,
  });

  const submit = async () =>
  {
    if (
      (form.nombre === "") ||
      (form.idCliente === "") ||
      !form.cantidadPrestamo
    )
    {
      return Alert.alert("Please provide all fields");
    }

    setUploading(true);
    const lendingService = new LendingService();

    try
    {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        1, // hour
        1, // minute
        0  // seconds
      );

      const newLending = {
        cliente_id: form.idCliente,
        tasa_interes: form.tasaInt,
        cantidad: form.cantidadPrestamo,
        fecha_inicio: startOfDay.toISOString(),
        fecha_fin: null,
      };


      const result = await lendingService.insertLending(newLending);

      console.log("result", result);


      if (!result)
      {
        throw new Error("Failed to create lending");
      }

      Alert.alert("Success", "Préstamo creado exitosamente");
      router.push("/home");
    }
    catch (error: any)
    {
      Alert.alert("Error", error.message || "Hubo un error al crear el préstamo");
    }
    finally
    {
      setForm({
        nombre: "",
        idCliente: "",
        tasaInt: 0,
        cantidadPrestamo: 0,
      });

      setSelectedClient(null);
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

          <ClientsAutocompleteInput
            onSelect={(client) =>
            {
              setSelectedClient(client);
              setForm({ ...form, nombre: client.nombre, idCliente: client.$id }); // optional
            }}
            otherStyles="mt-10"
          />

          <NumberField
            title="Tasa de interes (%)"
            value={form.tasaInt}
            placeholder="15%..."
            handleChangeText={(e) => setForm({ ...form, tasaInt: e })}
            otherStyles="mt-7"
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