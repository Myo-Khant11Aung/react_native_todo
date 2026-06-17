package main

import (
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
