package helper

import (
	"encoding/json"
	"errors"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
)

type UserDataToken struct {
	ID       int    `json:"id"`
	Role string `json:"role"`
}

func ParseHeaderAuthorization(ctx *gin.Context) UserDataToken {
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		log.Println("Authorization header not found")
		panic(errors.New("Authorization header not found"))
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		log.Println("Authorization header format is incorrect")
		panic(errors.New("Authorization header format is incorrect"))
	}

	tokenString := parts[1]

	var user UserDataToken
	err := json.Unmarshal([]byte(tokenString), &user)
	if err != nil {
		log.Println("Failed to parse token string: ", err)
		panic(errors.New("Failed to parse token"))
	}

	return user
}