package routes

import (
	"time"
	usercontroller "zen_computer/controllers/user_controller"
	"zen_computer/exception"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func InitRoute(app *gin.Engine) {
	route := app

	route.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

	route.Use(exception.GlobalErrorHandler())

	authRoute := route.Group("/api/v1/auth")
	{
		authRoute.POST("/signup", usercontroller.SignUp)
		authRoute.POST("/signin", usercontroller.SignIn)
		authRoute.POST("/signin/google", usercontroller.SignInWithGoogle)
        authRoute.GET("/currentuser", usercontroller.CurrentUser)
	}
}