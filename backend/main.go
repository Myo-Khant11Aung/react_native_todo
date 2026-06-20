package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/rs/cors"
)

func sendErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}

func sendSuccessResponse(w http.ResponseWriter, statusCode int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}
func main() {
	db := initDB()
	defer db.Close()
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})
	h := &Handler{db: db}

	mux := http.NewServeMux()

	// Auth routes
	mux.HandleFunc("/auth/signup", h.SignUp)
	mux.HandleFunc("/auth/login", h.Login)
	mux.HandleFunc("/gettodos", h.getTodos)
	mux.HandleFunc("/addtodo", h.addTodos)
	mux.HandleFunc("/deletetodo", h.deleteTodo)
	mux.HandleFunc("/edittodo", h.editTodo)
	handler := c.Handler(mux)

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
