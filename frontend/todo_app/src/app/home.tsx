import { SafeAreaView } from "react-native-safe-area-context";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import Checkbox from "expo-checkbox";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

type Todo = {
  todo_id: number;
  title: string;
  description: string;
  due_date: string;
};

const deleteTodo = async (todoID: number) => {
  const token = await SecureStore.getItemAsync("token");
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/deletetodo`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ todo_id: todoID }),
    },
  );
  console.log("delete status:", response.status);
  const data = await response.json();
  console.log("delete data:", data);
  if (!response.ok) {
    throw new Error(data.error || "Could not delete todo");
  }

  return data;
};

const TodoItems = ({
  todo,
  onDelete,
}: {
  todo: Todo;
  onDelete: (id: number) => void;
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheck = (value: boolean) => {
    setIsChecked(value);

    setTimeout(() => {
      Alert.alert("Delete Todo", `Are you done with "${todo.title}"?`, [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setIsChecked(false),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(todo.todo_id),
        },
      ]);
    }, 300); // 300ms delay
  };

  return (
    <View style={styles.todoItem}>
      <Pressable
        style={{ flex: 1, padding: 8 }}
        onPress={() =>
          router.push({
            pathname: "/todo_details",
            params: {
              todo_id: todo.todo_id,
              title: todo.title,
              description: todo.description,
              due_date: todo.due_date,
            },
          })
        }
      >
        <Text>{todo.title}</Text>
      </Pressable>
      <Checkbox value={isChecked} onValueChange={handleCheck} />
    </View>
  );
};
export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    router.replace("/");
  };

  useFocusEffect(
    useCallback(() => {
      const fetchTodos = async () => {
        setLoading(true);
        const token = await SecureStore.getItemAsync("token");
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/gettodos`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (!response.ok) {
            setError("Could not load todos");
            return;
          }
          const data = await response.json();
          setTodos(data);
        } catch (err) {
          setError("Network Error");
        } finally {
          setLoading(false);
        }
      };
      fetchTodos();
    }, []),
  );

  const handleDelete = async (todoID: number) => {
    try {
      await deleteTodo(todoID);
      setTodos((prev) => prev.filter((t) => t.todo_id !== todoID));
    } catch (err) {
      Alert.alert("Error", "Could not delete todo");
    } finally {
      Alert.alert("Todo deleted successfully");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>To Do List</Text>
        <Pressable
          onPress={handleLogout}
          style={{ backgroundColor: "#f0f0f0", padding: 8, borderRadius: 8 }}
        >
          <Text style={{ color: "black", fontWeight: "bold" }}>Logout</Text>
        </Pressable>
      </View>
      {error ? (
        <View
          style={{
            padding: 16,
            backgroundColor: "#ffe0e0",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      ) : null}
      {loading ? (
        <ActivityIndicator size="large" color="maroon" />
      ) : (
        <ScrollView style={styles.todolist}>
          {todos.map((todo) => (
            <TodoItems key={todo.todo_id} todo={todo} onDelete={handleDelete} />
          ))}
        </ScrollView>
      )}

      <Pressable
        onPress={() => router.push("/add_todo")}
        style={styles.addButton}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Add Todo </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
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
  todoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 8,
    marginBottom: 8,
    marginHorizontal: 8,
    borderRadius: 16,
  },
  todolist: {
    flex: 1,
    width: "100%",
  },
  addButton: {
    backgroundColor: "maroon",
    padding: 16,
    margin: 16,
    borderRadius: 16,
    width: "90%",
    alignItems: "center",
  },
});
