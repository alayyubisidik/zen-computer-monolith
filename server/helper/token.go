package helper

import (
	"encoding/json"
	"strings"
	"zen_computer/exception"

	"github.com/gin-gonic/gin"
)

type UserDataToken struct {
	ID       int    `json:"id"`
	Role string `json:"role"`
}

func ParseHeaderAuthorization(ctx *gin.Context) (UserDataToken, error) {
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		return UserDataToken{}, exception.NewUnAuthorizedError("Unauthorized")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return UserDataToken{}, exception.NewUnAuthorizedError("Unauthorized")
	}

	tokenString := parts[1]

	var user UserDataToken
	err := json.Unmarshal([]byte(tokenString), &user)
	if err != nil {
		return UserDataToken{}, exception.NewUnAuthorizedError("Unauthorized")
	}

	return user, nil
}