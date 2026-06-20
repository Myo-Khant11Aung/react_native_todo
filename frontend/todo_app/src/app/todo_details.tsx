import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TodoDetails() {
  const { todo_id, title, description, due_date } = useLocalSearchParams();
  const [editClicked, setEditClicked] = useState(false);
  const [editTitle, setEditTitle] = useState(title as string);
  const [editDescription, setEditDescription] = useState(description as string);
  const [editDueDate, setEditDueDate] = useState(() => {
    const date = new Date(due_date as string);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date;
  });

  const onCancel = () => {
    setEditClicked(false);
    setEditTitle(title as string);
    setEditDescription(description as string);
    setEditDueDate(() => {
      const date = new Date(due_date as string);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      return date;
    });
  };

  const handleConfirm = async () => {
    if (!editTitle) {
      Alert.alert("Error", "Title is required.");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/edittodo`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            todo_id: Number(todo_id),
            title: editTitle,
            description: editDescription,
            due_date: editDueDate.toISOString(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.error || "Could not update todo");
        return;
      }

      Alert.alert("Success", "Todo updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Network error. Is your server running?");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>Task Details</Text>
        <Pressable
          style={{ backgroundColor: "#f0f0f0", padding: 8, borderRadius: 8 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "black", fontWeight: "bold" }}>Back</Text>
        </Pressable>
      </View>
      {!editClicked ? (
        <ScrollView style={styles.details_container}>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.label}>Todo title</Text>
            <Text style={styles.input}>{title}</Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.label}>Todo description</Text>
            <Text style={[styles.input, { minHeight: 200 }]}>
              {description}
            </Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.label}>Due date</Text>
            <Text style={styles.input}>{due_date}</Text>
          </View>
          <View style={styles.footer}>
            <Pressable
              style={styles.editButton}
              onPress={() => setEditClicked(true)}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Edit</Text>
            </Pressable>
            <Pressable
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  "Delete Todo",
                  `Are you sure you want to delete "${title}"?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          const token = await SecureStore.getItemAsync("token");
                          const response = await fetch(
                            `${process.env.EXPO_PUBLIC_API_URL}/deletetodo`,
                            {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                todo_id: Number(todo_id),
                              }),
                            },
                          );

                          if (!response.ok) {
                            Alert.alert("Error", "Could not delete todo");
                            return;
                          }

                          router.back();
                        } catch (err) {
                          Alert.alert(
                            "Error",
                            "Network error. Is your server running?",
                          );
                        }
                      },
                    },
                  ],
                );
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Delete</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.details_container}>
            <View style={styles.inputcontainer}>
              <Text style={styles.label}>Todo Title</Text>
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                style={styles.input}
              />
              <Text style={styles.label}>Todo Description</Text>
              <TextInput
                style={[styles.input, { minHeight: 200 }]}
                multiline
                textAlignVertical="top"
                value={editDescription}
                onChangeText={setEditDescription}
              />
              <Text style={styles.label}>Due Date</Text>
              <DateTimePicker
                value={editDueDate}
                mode="date"
                display="inline"
                onChange={(event, selectedDate) => {
                  if (selectedDate) setEditDueDate(selectedDate);
                }}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.editButton} onPress={handleConfirm}>
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Confirm
              </Text>
            </Pressable>
            <Pressable style={styles.editButton} onPress={onCancel}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Cancle</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  details_container: {
    flex: 1,
    padding: 8,
  },
  label: {
    fontSize: 12,
    color: "gray",
    marginBottom: 4,
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: "maroon",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "darkred",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
});
