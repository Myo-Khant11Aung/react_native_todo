import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddTodo() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    Alert.alert("Cancel", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => router.back() },
    ]);
  };

  const handleConfirm = async () => {
    if (!title) {
      Alert.alert("Error", "Title is required.");
      return;
    }

    const shortDescription =
      description.length > 50
        ? description.substring(0, 50) + "..."
        : description;
    Alert.alert(
      "Confirm Todo",
      `Title: ${title}\nDescription: ${shortDescription}\nDue Date: ${dueDate.toDateString()}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => submitTodo() },
      ],
    );
  };

  const submitTodo = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/addtodo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            due_date: dueDate.toISOString(),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Error", data.error || "Could not add todo");
        return;
      }

      Alert.alert("Success", "Todo added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Network error. Is your server running?");
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>Add a task</Text>
        <Pressable
          style={{ backgroundColor: "#f0f0f0", padding: 8, borderRadius: 8 }}
          onPress={handleCancel}
        >
          <Text style={{ color: "red", fontWeight: "bold" }}>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.inputcontainer}>
        <Text style={[{ marginBottom: 4 }, styles.label]}>Todo Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />
        <Text style={[{ marginTop: 16, marginBottom: 4 }, styles.label]}>
          Todo Description
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { minHeight: 200 }]}
          multiline
          textAlignVertical="top"
        />
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="inline"
          onChange={(event, selectedDate) => {
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      </View>

      <Pressable onPress={handleConfirm} style={styles.addButton}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Confirm </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    backgroundColor: "maroon",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  input: {
    height: 40,
    borderWidth: 3,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputcontainer: {
    flex: 1,
    margin: 16,
  },
  addButton: {
    backgroundColor: "maroon",
    padding: 16,
    margin: 16,
    borderRadius: 16,
    width: "90%",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "gray",
    marginBottom: 4,
    marginTop: 16,
  },
});
