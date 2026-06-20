package main

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SignupRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type Handler struct {
	db *pgxpool.Pool
}

type Claims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Todo struct {
	TodoID      int       `json:"todo_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	DueDate     time.Time `json:"due_date"`
}

type AddTodoRequest struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	DueDate     time.Time `json:"due_date"`
}

type DeleteRequest struct {
	TodoID int `json:"todo_id"`
}

type EditTodoRequest struct {
	TodoID      int       `json:"todo_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	DueDate     time.Time `json:"due_date"`
}
