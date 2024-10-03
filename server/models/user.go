package models

import "time"

type User struct {
	ID             int `gorm:"primaryKey;autoIncrement"`
	FullName       string
	Email          string
	Password       string
	Role           string `gorm:"default:customer"`
	PhoneNumber    string
	DateOfBirth    time.Time
	Gender         string
	Image string `gorm:"default:https://res.cloudinary.com/dmerqdsm3/image/upload/v1724317816/profile-picture/tvrg2tuayakndkpoldqj.jpg"`
	PublicId        string `gorm:"default:profile-picture/tvrg2tuayakndkpoldqj"`
	Status         string   `gorm:"default:active"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
