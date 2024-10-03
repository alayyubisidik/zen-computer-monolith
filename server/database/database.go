package database

import (
	"fmt"
	"log"
	"zen_computer/helper"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	var errConn error

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_NAME"))

	DB, errConn = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	helper.PanicIfError(errConn)

	log.Println("Connected to database")
}
// migrate create -ext sql -dir database/migrations create_users_table

// migrate -database "mysql://root:@tcp(127.0.0.1:3306)/zen_computer_monolith?charset=utf8mb4&parseTime=True&loc=Local" -path database/migrations up
// migrate -database "mysql://root:@tcp(127.0.0.1:3306)/zen_computer_monolith?charset=utf8mb4&parseTime=True&loc=Local" -path database/migrations down
// migrate -database "mysql://root:@tcp(127.0.0.1:3306)/zen_computer_monolith?charset=utf8mb4&parseTime=True&loc=Local" -path database/migrations force 9863498326134
// migrate -database "mysql://root:@tcp(127.0.0.1:3306)/zen_computer_monolith?charset=utf8mb4&parseTime=True&loc=Local" -path database/migrations version