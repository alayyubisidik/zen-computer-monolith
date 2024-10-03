package main

import (
	"log"
	"zen_computer/database"
	"zen_computer/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

	app := gin.Default()

	database.ConnectDatabase()

	routes.InitRoute(app)

	app.Run(":8000")
}