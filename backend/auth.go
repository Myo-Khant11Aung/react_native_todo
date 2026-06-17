package main

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

func ()

func (h *Handler) SignUp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req SignupRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	email := req.Email
	username := req.Username
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Error hashing password")
		return
	}

	var userID int
err = h.db.QueryRow(r.Context(), 
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
    req.Name, req.Email, string(hashedPassword),
).Scan(&userID)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			sendErrorResponse(w, http.StatusConflict, "Email already exists")
			return
		}
		sendErrorResponse(w, http.StatusInternalServerError, "Could not create user")
		return
	}

}
