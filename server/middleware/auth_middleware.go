package middleware

import (
	"zen_computer/exception"
	"zen_computer/helper"

	"github.com/gin-gonic/gin"
)


func AuthMiddleware(ctx *gin.Context) {
	user, err := helper.ParseHeaderAuthorization(ctx)
	if err != nil {
		ctx.Error(err)
		ctx.Abort()     
		return
	}

    if user.ID == 0 {
		ctx.Error(exception.NewUnAuthorizedError("Unauthorized"))
		ctx.Abort()     
		return 
	}

	ctx.Set("userId", user.ID)
	ctx.Set("role", user.Role)
	ctx.Next()
}
