package middleware

import (
	"zen_computer/exception"

	"github.com/gin-gonic/gin"
)

func OnlyAdmin(ctx *gin.Context) {
	roleFromToken, _ := ctx.Get("role")

    if roleFromToken != "admin" {
		ctx.Error(exception.NewUnAuthorizedError("Unauthorized"))
		ctx.Abort()     
		return
	}

    ctx.Next()
}
