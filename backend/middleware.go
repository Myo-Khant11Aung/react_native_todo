package main

import (
	"errors"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func validateJwt(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) { return []byte(os.Getenv("JWT_SECRET")), nil })
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func protect(w http.ResponseWriter, r *http.Request) (*Claims, bool) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		sendErrorResponse(w, http.StatusUnauthorized, "Missing token")
		return nil, false
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	claims, err := validateJwt(tokenString)
	if err != nil {
		sendErrorResponse(w, http.StatusUnauthorized, "Invalid token")
		return nil, false
	}

	return claims, true
}
