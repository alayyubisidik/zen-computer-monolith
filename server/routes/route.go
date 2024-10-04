package routes

import (
	"time"
	usercontroller "zen_computer/controllers/user_controller"
	categorycontroller "zen_computer/controllers/category_controller"
	"zen_computer/exception"
	"zen_computer/middleware"

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

	groupRoute := route.Group("/api/v1")
	{
		groupRoute.POST("/auth/signup", usercontroller.SignUp)
		groupRoute.POST("/auth/signin", usercontroller.SignIn)
		groupRoute.POST("/auth/signin/google", usercontroller.SignInWithGoogle)
        groupRoute.GET("/auth/currentuser", usercontroller.CurrentUser)
        groupRoute.PUT("/auth/:userId", middleware.AuthMiddleware, middleware.VerifyOwner, usercontroller.Update)
        groupRoute.GET("/auth/users", middleware.AuthMiddleware, middleware.OnlyAdmin, usercontroller.GetAll)
		groupRoute.PUT("/auth/users/change-status/:userId", middleware.AuthMiddleware, middleware.OnlyAdmin, usercontroller.ChangeStatus)

		groupRoute.POST("/categories", categorycontroller.Create)
        // groupRoute.GET("/categories", categorycontroller.GetAll)
        // groupRoute.GET("/categories/:categorySlug", categorycontroller.GetBySlug)
        // groupRoute.PUT("/categories/:categorySlug", categorycontroller.Update)
        // groupRoute.DELETE("/categories/:categorySlug", categorycontroller.Delete)
	}
}