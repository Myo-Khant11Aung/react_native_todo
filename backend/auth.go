package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/bcrypt"
)

func GenerateJWT(userID int) (string, error) {
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := os.Getenv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

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
		username, email, string(hashedPassword),
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
	token, err := GenerateJWT(userID)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Could not generate token")
		return
	}

	sendSuccessResponse(w, http.StatusCreated, map[string]string{
		"token": token,
	})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendErrorResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var req LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		sendErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var userID int
	var hashedPassword string
	err = h.db.QueryRow(r.Context(),
		"SELECT id, password FROM users WHERE email = $1",
		req.Email,
	).Scan(&userID, &hashedPassword)
	if err != nil {
		sendErrorResponse(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password))
	if err != nil {
		sendErrorResponse(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	token, err := GenerateJWT(userID)
	if err != nil {
		sendErrorResponse(w, http.StatusInternalServerError, "Could not generate token")
		return
	}

	sendSuccessResponse(w, http.StatusOK, map[string]string{
		"token": token,
	})
}
