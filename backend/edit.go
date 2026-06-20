package main

import (
	"encoding/json"
	"net/http"
	"time"
)

func (h *Handler) editTodo(w http.ResponseWriter, r *http.Request) {
	claims, ok := protect(w, r)
	if !ok {
		sendErrorResponse(w, http.StatusUnauthorized, "Token expired")
		return
	}

	if r.Method != http.MethodPut {
		sendErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	userID := claims.UserID

	var req EditTodoRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var todo Todo
	err = h.db.QueryRow(r.Context(),
		"UPDATE todos SET title=$1, description=$2, due_date=$3, updated_at=$4 WHERE id=$5 AND user_id=$6 RETURNING id, title, description, due_date",
		req.Title, req.Description, req.DueDate, time.Now(), req.TodoID, userID,
	).Scan(&todo.TodoID, &todo.Title, &todo.Description, &todo.DueDate)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Could not update todo")
		return
	}

	sendSuccessResponse(w, http.StatusOK, map[string]any{
		"message": "Todo updated successfully",
	})
}
