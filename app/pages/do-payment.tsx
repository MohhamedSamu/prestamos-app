import React from "react";
import { useState } from "react";
import { Text, View, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import images from "../../constants/images";
import NumberField from "../../components/NumberField";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

const DoPayment = () => {

    const [uploading, setUploading] = useState(false);
    const [interes, setInteres] = useState(0.0);
    const [form, setForm] = useState({
      nombre: "",
      cantidadPagar: 0,
    });
  
    const submit = async () =>
    {
      if (
        (form.nombre === "") ||
        !form.cantidadPagar
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
          cantidadPagar: 0,
        });
        setInteres(0.0);
  
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

          <FormField
            title="Nombre del cliente"
            value={form.nombre}
            placeholder="Roman Riquelme..."
            handleChangeText={(e) => setForm({ ...form, nombre: e })}
            otherStyles="mt-10"
          />

          <NumberField
            title="Cantidad de dinero a pagar"
            value={form.cantidadPagar}
            placeholder="200 ..."
            handleChangeText={(e) => setForm({ ...form, cantidadPagar: e })}
            otherStyles="mt-7"
          />

          <Text className="text-xl font-pregular text-gray-100 mt-7">
            Cantidad de intereses a pagar: 
          </Text>
          <Text className="text-2xl font-pregular text-red-500 mb-2">
          $5.10 
          </Text>

          <CustomButton
            title="Agregar pago"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={uploading}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default DoPayment