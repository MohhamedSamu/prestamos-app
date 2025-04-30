import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { LendingService } from "../lib/LendingService";
import { LendingDocument } from "../lib/types";
import { formatDateToSpanish } from "../lib/utils/dateFormat";

interface LendingsAutocompleteInputProps {
  clientId: string;
  onSelect: (lending: LendingDocument) => void;
  otherStyles?: string;
  showOnlyActive?: boolean;
}

const LendingsAutocompleteInput: React.FC<LendingsAutocompleteInputProps> = ({
  clientId,
  onSelect,
  otherStyles = "",
  showOnlyActive = true,
}) => {
  const [lendings, setLendings] = useState<LendingDocument[]>([]);
  const [value, setValue] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isFocus, setIsFocus] = useState(false);
  const [loading, setLoading] = useState(false);

  const lendingService = new LendingService();

  useEffect(() => {
    if (clientId) {
      fetchLendings();
    } else {
      setLendings([]);
      setValue(null);
    }
  }, [clientId]);

  const fetchLendings = async () => {
    setLoading(true);
    try {
      let data;
      if (showOnlyActive) {
        data = await lendingService.getActiveLendingsByClientId(clientId);
      } else {
        data = await lendingService.getLendingsByClientId(clientId);
      }
      setLendings(data || []);
    } catch (error) {
      console.error("Error fetching lendings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mappedData = lendings.map((lending) => ({
      label: `$${lending.cantidad} - ${formatDateToSpanish(lending.fecha_inicio)}`,
      value: lending.$id,
      lending,
    }));
    setData(mappedData);
  }, [lendings]);

  const handleChange = (item: any) => {
    setValue(item.value);
    onSelect(item.lending);
    setIsFocus(false);
  };

  const renderLabel = () => {
    if (isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: "#3B82F6" }]}>
          Elige un préstamo
        </Text>
      );
    }
    return null;
  };

  if (!clientId) {
    return (
      <View className={`space-y-2 ${otherStyles}`}>
        <Text className="text-base text-gray-100 font-pmedium">Préstamo</Text>
        <View style={[styles.dropdown, { justifyContent: "center" }]}>
          <Text style={styles.placeholderStyle}>Primero selecciona un cliente</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-100 font-pmedium">Préstamo</Text>
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
        searchField="label"
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={loading ? "Cargando préstamos..." : data.length === 0 ? "No hay préstamos activos" : "Seleccionar préstamo..."}
        searchPlaceholder="Buscar..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={handleChange}
        disable={loading || data.length === 0}
      />
    </View>
  );
};

export default LendingsAutocompleteInput;

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