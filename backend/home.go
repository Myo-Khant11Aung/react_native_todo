package main

import (
	"encoding/json"
	"net/http"
	"time"
)

func (h *Handler) getTodos(w http.ResponseWriter, r *http.Request) {

	claims, ok := protect(w, r)
	if !ok {
		sendErrorResponse(w, http.StatusLocked, "Token expired")
		return
	}

	userID := claims.UserID
	if r.Method != http.MethodGet {
		sendErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	rows, err := h.db.Query(r.Context(), "SELECT id, title, description, due_date FROM todos WHERE user_id=$1", userID)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Could not get todos")
		return
	}
	defer rows.Close()

	todos := []Todo{}
	for rows.Next() {
		var todo Todo
		err := rows.Scan(&todo.TodoID, &todo.Title, &todo.Description, &todo.DueDate)
		if err != nil {
			sendErrorResponse(w, http.StatusInternalServerError, "Could not scan todos")
			return
		}
		todos = append(todos, todo)
	}
	sendSuccessResponse(w, http.StatusOK, todos)
}

func (h *Handler) addTodos(w http.ResponseWriter, r *http.Request) {
	claims, ok := protect(w, r)
	if !ok {
		sendErrorResponse(w, http.StatusLocked, "Token expired")
		return
	}
	if r.Method != http.MethodPost {
		sendErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID := claims.UserID
	var req AddTodoRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	var todo Todo
	err = h.db.QueryRow(r.Context(),
		"INSERT INTO todos (user_id, title, description, due_date, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, title, description, due_date",
		userID, req.Title, req.Description, req.DueDate, time.Now(), time.Now()).Scan(&todo.TodoID, &todo.Title, &todo.Description, &todo.DueDate)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Could not add todo")
		return
	}
	sendSuccessResponse(w, http.StatusCreated, map[string]any{
		"message": "Todo created successfully",
		"todo":    todo,
	})
}
