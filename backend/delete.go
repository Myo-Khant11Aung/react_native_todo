package main

import (
	"encoding/json"
	"net/http"
)

func (h *Handler) deleteTodo(w http.ResponseWriter, r *http.Request) {
	claims, ok := protect(w, r)
	if !ok {
		sendErrorResponse(w, http.StatusLocked, "Token expired")
		return
	}

	userID := claims.UserID
	if r.Method != http.MethodDelete {
		sendErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req DeleteRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	_, err = h.db.Exec(r.Context(), "DELETE FROM todos WHERE id=$1 AND user_id=$2", req.TodoID, userID)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Could not delete todo")
		return
	}
	sendSuccessResponse(w, http.StatusOK, map[string]string{
		"message": "Todo deleted successfully",
	})

}
