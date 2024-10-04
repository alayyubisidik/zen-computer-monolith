package middleware

import (
	"zen_computer/helper"
	"zen_computer/exception"

	"github.com/gin-gonic/gin"
	"strconv"
)

func VerifyOwner(ctx *gin.Context) {
	userId := ctx.Param("userId")
	id, err := strconv.Atoi(userId)
	helper.PanicIfError(err)
	
	userIdFromToken, _ := ctx.Get("userId")

    if userIdFromToken != id {
		ctx.Error(exception.NewUnAuthorizedError("Unauthorized"))
		ctx.Abort()     
		return
	}

    ctx.Next()
}
