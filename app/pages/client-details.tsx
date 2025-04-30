import React, { useEffect, useState } from "react";
import { Text, View, Image, ScrollView, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import images from "../../constants/images";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import ComboBox from "../../components/ComboBox";

import { ClientsService } from "../../lib/ClientsService";
import { Client, ClientDocument } from "../../lib/types";

import { LendingService } from "../../lib/LendingService";
import { LendingDocument } from "../../lib/types";


const options = [
  { value: "quincenal", placeholder: "Cada quincena" },
  { value: "mensual", placeholder: "Cada mes" },
  { value: "catorcenal", placeholder: "Cada 14 días" },
];

const ClientDetails = () =>
{
  const { clientId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState<ClientDocument | null>(null);
  const [clientObj, setClientObj] = useState<ClientDocument | null>(null);
  const clientService = new ClientsService();

  const [lendings, setLendings] = useState<LendingDocument[]>([]);
  const lendingService = new LendingService();

  useEffect(() =>
  {
    loadClient();
    loadLendings();
  }, [clientId]);


  const loadClient = async () =>
  {
    try
    {
      const data = await clientService.getClientById(clientId as string);
      setForm(data);
      setClientObj(data);
    } catch (error)
    {
      Alert.alert("Error", "No se pudo cargar la información del cliente");
    } finally
    {
      setLoading(false);
    }
  };

  const loadLendings = async () =>
  {
    try
    {
      const data = await lendingService.getLendingsByClientId(clientId as string);
      if (data) setLendings(data);
    } catch (error)
    {
      console.error("Error loading lendings:", error);
    }
  };


  const submit = async () =>
  {
    if (!form) return;

    setUpdating(true);
    try
    {
      const cleanedForm: Client = cleanClientData(form)
      await clientService.updateClient(clientId as string, cleanedForm);
      Alert.alert("Éxito", "Cliente actualizado correctamente");
      router.push("/home");
    } catch (error)
    {
      Alert.alert("Error", "No se pudo actualizar el cliente");
    } finally
    {
      setUpdating(false);
    }
  };

  const cleanClientData = (client: ClientDocument): Client =>
  {
    const { $id, $collectionId, $databaseId, $createdAt, $updatedAt, $permissions, ...cleanData } = client;
    return cleanData;
  };


  if (loading)
  {
    return (
      <SafeAreaView className="bg-primary h-full flex justify-center items-center">
        <Text className="text-white text-xl">Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }}>
        <View className="mt-6 px-4 space-y-6 mb-6 pb-20 pt-5">
          <View className="flex justify-between items-start flex-row mb-6">
            <View>
              <Text className="font-pmedium text-sm text-gray-100">Bienvenido de regreso</Text>
              <Text className="text-2xl font-psemibold text-white">A tu control</Text>
            </View>
            <View className="mt-1.5">
              <Image source={images.logoSmall} className="w-9 h-10" resizeMode="contain" />
            </View>
          </View>

          <Text className="text-2xl text-center font-pregular text-gray-100 mb-3">Editar Cliente</Text>

          {form && (
            <>
              <FormField title="Nombre del cliente" value={form.nombre} placeholder="Roman Riquelme..." handleChangeText={(e) => setForm({ ...form, nombre: e })} />
              <FormField title="Domicilio" value={form.domicilio} placeholder="Colonia, ciudad, casa..." handleChangeText={(e) => setForm({ ...form, domicilio: e })} />
              <FormField title="Numero de telefono" value={form.numero} placeholder="7789 5151 ..." handleChangeText={(e) => setForm({ ...form, numero: e })} />
              <Text className="text-xl font-pregular text-gray-100 mb-2 mt-7">Periodo de amortización</Text>
              <ComboBox options={options} defaultOption={form.periodo} onSelect={(e) => setForm({ ...form, periodo: e.value })} />

              <CustomButton title="Actualizar Cliente" handlePress={submit} isLoading={updating} />

              <Text className="text-2xl text-center font-pregular text-gray-100 mb-3 mt-10">
                Préstamos del cliente
              </Text>

              {lendings.length === 0 ? (
                <Text className="text-lg text-center font-pregular text-gray-400">
                  No hay préstamos aún.
                </Text>
              ) : (
                lendings.map((lending) => (
                  <TouchableOpacity
                    key={lending.$id}
                    className="my-2 p-3 bg-blue-700 rounded-xl"
                    onPress={() => {
                      console.log("Client period when navigating:", clientObj?.periodo);
                      router.push({
                        pathname: "/pages/lend-details",
                        params: {
                          lendingId: lending.$id,
                          clientPeriod: clientObj?.periodo,
                        },
                      });
                    }}
                  >
                    <Text className="text-white font-psemibold text-lg">💰 {lending.cantidad}</Text>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClientDetails;
