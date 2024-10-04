package categorycontroller

import (
	"zen_computer/database"
	"zen_computer/exception"
	"zen_computer/helper"
	"zen_computer/models"
	"zen_computer/request"
	"zen_computer/response"

	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

func Create(ctx *gin.Context) {
	var categoryCreateRequest request.CategoryCreateRequest
	if err := ctx.ShouldBindWith(&categoryCreateRequest, binding.FormMultipart); err != nil {
		ctx.Error(err)
		return
	}

	category := models.Category{
		Name: categoryCreateRequest.Name,
		Slug: slug.Make(categoryCreateRequest.Name),
		SvgIcon: categoryCreateRequest.SvgIcon,
	}

	var existingCategory models.Category
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		err := database.DB.Take(&existingCategory, "slug = ?", category.Slug).Error
		if err == nil && existingCategory.ID != 0 {
			return exception.NewConflictError("category already exists")
		}
		
		err = tx.Save(&category).Error
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(http.StatusCreated, response.WebResponse{
		Data: helper.ToCategoryResponse(category),
	})
}
