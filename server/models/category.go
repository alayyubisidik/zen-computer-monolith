package models

import (
	"time"
)

type Category struct {
	ID        int `gorm:"primaryKey;autoIncrement"`
	Name      string
	Slug      string
	SvgIcon  string
	CreatedAt time.Time
	UpdatedAt time.Time
}
