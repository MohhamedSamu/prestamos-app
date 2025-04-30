import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { ClientsService } from "../lib/ClientsService";
import { ClientDocument } from "../lib/types";

interface ClientsAutocompleteInputProps {
  onSelect: (client: ClientDocument) => void;
  otherStyles?: string;
}

const ClientsAutocompleteInput: React.FC<ClientsAutocompleteInputProps> = ({
  onSelect,
  otherStyles = "",
}) => {
  const [clients, setClients] = useState<ClientDocument[]>([]);
  const [value, setValue] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isFocus, setIsFocus] = useState(false);

  const clientService = new ClientsService();

  useEffect(() => {
    const fetchClients = async () => {
      const data = await clientService.getAllClients();
      setClients(data || []);
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const mappedData = clients.map((client) => ({
      label: client.nombre,
      value: client.$id,
      client,
    }));
    setData(mappedData);
  }, [clients]);

  const handleChange = (item: any) => {
    setValue(item.value);
    onSelect(item.client);
    setIsFocus(false);
  };

  const renderLabel = () => {
    if (isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: "#3B82F6" }]}>
          Elige un cliente o busca su nombre
        </Text>
      );
    }
    return null;
  };

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100 font-pmedium">Nombre del cliente</Text>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && styles.dropdownFocus]}
        containerStyle={styles.dropdownContainer}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "Buscar cliente..." : "..."}
        searchPlaceholder="Buscar..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={handleChange}
      />
    </View>
  );
};

export default ClientsAutocompleteInput;

const styles = StyleSheet.create({
  dropdown: {
    height: 64,
    backgroundColor: "#1E1E1E", // similar to black-100
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2C2C2E", // similar to black-200
    paddingHorizontal: 16,
    justifyContent: "center",
    color: "#FFFFFF",
  },
  dropdownFocus: {
    borderColor: "#3B82F6", // secondary
    color: "#FFFFFF",
  },
  dropdownContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    color: "#FFFFFF",
  },
  placeholderStyle: {
    color: "#7B7B8B",
    fontSize: 16,
  },
  selectedTextStyle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: "#FFFFFF",
    backgroundColor: "#1E1E1E",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  label: {
    position: "absolute",
    left: 22,
    top: -12,
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#FFFFFF",
    zIndex: 10,
  },
});
