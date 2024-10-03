package helper

import (
	"os"
	"path/filepath"
	"zen_computer/exception"

	"fmt"

	"github.com/gin-gonic/gin"
)

func ValidateImageFile(ctx *gin.Context) error {
	fileHeader, err := ctx.FormFile("image")
	if err != nil {
		return exception.NewBadRequestError("profile picture is required")
	}

	const maxFileSize = 5 * 1024 * 1024 
	if fileHeader.Size > maxFileSize {
		return exception.NewBadRequestError("Image file is too large")
	}

	allowedExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
	}
	ext := filepath.Ext(fileHeader.Filename)
	if !allowedExtensions[ext] {
		return exception.NewBadRequestError("Invalid file extension")
	}

	return nil
}


func DeleteImage(fileName string) error {
    filePath := fmt.Sprintf("./public/images/%s", fileName)
    if err := os.Remove(filePath); err != nil {
        return err
    }
    return nil
}
