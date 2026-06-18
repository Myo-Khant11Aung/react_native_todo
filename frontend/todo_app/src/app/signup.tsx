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
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    console.log("Signup button clicked");
    setLoading(true);
    if (!email || !username || !password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    try {
      console.log("API URL:", process.env.EXPO_PUBLIC_API_URL);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, password }),
        },
      );
      const data = await response.json();
      console.log("status:", response.status);
      console.log("data:", data);

      if (!response.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      await SecureStore.setItemAsync("token", data.token);
      router.replace("/home");
    } catch (err) {
      console.log("catch error:", err);
      setError("Network error. Is your server running?");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.signupCard}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        <Pressable
          style={[styles.signupButton, loading && { opacity: 0.6 }]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {loading ? "Signing up..." : "Sign Up"}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.dismissTo("/")}>
          <Text style={{ color: "blue", marginTop: 10 }}>
            Already have an account? Login
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "maroon",
    justifyContent: "center",
    alignItems: "center",
  },
  signupCard: {
    flex: 1 / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightgray",
    width: "80%",
    borderRadius: 10,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  signupButton: {
    backgroundColor: "maroon",
    width: "80%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
});
