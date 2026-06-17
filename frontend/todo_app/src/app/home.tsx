import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import Checkbox from "expo-checkbox";

const todos = [
  {
    id: 1,
    title: "Buy groceries",
    description: "Milk, eggs, bread, and coffee",
    dueDate: "2026-06-15",
  },
  {
    id: 2,
    title: "Fix login bug",
    description: "Users are getting 401 on correct credentials",
    dueDate: "2026-06-14",
  },
  {
    id: 3,
    title: "Call dentist",
    description: "Schedule cleaning appointment",
    dueDate: "2026-06-20",
  },
  {
    id: 4,
    title: "Review pull request",
    description: "Check Myo's PR for the auth refactor",
    dueDate: "2026-06-13",
  },
  {
    id: 5,
    title: "Pay electricity bill",
    description: "Due by end of the month",
    dueDate: "2026-06-30",
  },
  {
    id: 6,
    title: "Read Go documentation",
    description: "Focus on net/http and middleware patterns",
    dueDate: "2026-06-18",
  },
  {
    id: 7,
    title: "Grocery run",
    description: "Pick up ingredients for dinner",
    dueDate: "2026-06-14",
  },
  {
    id: 8,
    title: "Update resume",
    description: "Add recent projects and skills",
    dueDate: "2026-06-22",
  },
  {
    id: 9,
    title: "Team standup prep",
    description: "Write up yesterday's progress and blockers",
    dueDate: "2026-06-13",
  },
  {
    id: 10,
    title: "Set up Postgres locally",
    description: "Create todo_app database and run migrations",
    dueDate: "2026-06-14",
  },
  {
    id: 11,
    title: "Learn FlatList",
    description: "Understand keyExtractor and renderItem",
    dueDate: "2026-06-15",
  },
  {
    id: 12,
    title: "Book flight tickets",
    description: "Check prices for July trip",
    dueDate: "2026-06-25",
  },
  {
    id: 13,
    title: "Water the plants",
    description: "They look sad",
    dueDate: "2026-06-13",
  },
  {
    id: 14,
    title: "Write unit tests",
    description: "Cover the auth middleware in Go",
    dueDate: "2026-06-28",
  },
  {
    id: 15,
    title: "Clean up desk",
    description: "It's getting out of hand",
    dueDate: "2026-06-13",
  },
];
type Todo = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
};

const TodoItems = ({ todo }: { todo: Todo }) => {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <View key={todo.id} style={styles.todoItem}>
      <Pressable
        style={{ flex: 1, padding: 8 }}
        onPress={() => alert("Button clicked!")}
      >
        <Text>{todo.title}</Text>
      </Pressable>
      <Checkbox value={isChecked} onValueChange={setIsChecked}></Checkbox>
    </View>
  );
};

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>To Do List</Text>
      </View>

      <ScrollView style={styles.todolist}>
        {todos.map((todo) => (
          <TodoItems key={todo.id} todo={todo} />
        ))}
      </ScrollView>
      <View style={styles.addButton}>
        <Pressable>
          <Text style={{ color: "white", fontWeight: "bold" }}>Add Todo </Text>
        </Pressable>
      </View>
    </View>
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
    justifyContent: "center",
    padding: 16,
    marginBottom: 8,
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
