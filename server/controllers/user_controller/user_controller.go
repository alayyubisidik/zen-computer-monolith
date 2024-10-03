package usercontroller

import (
	"errors"
	"net/http"
	"os"
	"zen_computer/database"
	"zen_computer/exception"
	"zen_computer/helper"

	// "zen_computer/lib"
	"zen_computer/models"
	"zen_computer/request"
	"zen_computer/response"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"gorm.io/gorm"
)

func SignUp(ctx *gin.Context) {
	var urlCloudinary = os.Getenv("CLOUDINARY_URL")

	var userSignUpRequest request.UserSignUpCredentialRequest

	if err := ctx.ShouldBindWith(&userSignUpRequest, binding.FormMultipart); err != nil {
		ctx.Error(err)
		return
	}

	if userSignUpRequest.Image != nil {
		err := helper.ValidateImageFile(ctx)
		if err != nil {
			ctx.Error(err)
			return
		}
	}

	hashedPassword, err := helper.HashPassword(userSignUpRequest.Password)
	helper.PanicIfError(err)

	user := models.User{
		FullName:    userSignUpRequest.FullName,
		Password:    hashedPassword,
		Email:       userSignUpRequest.Email,
		PhoneNumber: userSignUpRequest.PhoneNumber,
		DateOfBirth: userSignUpRequest.DateOfBirth,
		Gender:      userSignUpRequest.Gender,
	}

	if user.Email == "admin@gmail.com" {
		user.Role = "admin"
	}

	var existingUser models.User

	err = database.DB.Take(&existingUser, "email = ?", user.Email).Error
	if err == nil && existingUser.ID != 0 {
		ctx.Error(exception.NewConflictError("email already exists"))
		return
	}

	if userSignUpRequest.Image != nil {
		cldService, err := cloudinary.NewFromURL(urlCloudinary)
		if err != nil {
			ctx.Error(err)
			return
		}
		resp, err := cldService.Upload.Upload(ctx, userSignUpRequest.Image, uploader.UploadParams{
			Folder: "profile-picture",
		})

		if err != nil {
			ctx.Error(err)
			return
		}

		user.Image = resp.SecureURL
		user.PublicId = resp.PublicID
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Create(&user).Error
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
		Data: helper.ToUserResponse(user),
	})
}

func SignIn(ctx *gin.Context) {
	var userSignInRequest request.UserSignInRequest

	err := ctx.ShouldBind(&userSignInRequest)
	helper.PanicIfError(err)

	var user models.User
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Take(&user, "email = ? ", userSignInRequest.Email).Error
		if err != nil {
			return errors.New("invalid credentials")
		}

		err = helper.ComparePassword(user.Password, userSignInRequest.Password)
		if err != nil {
			return errors.New("invalid credentials")
		}

		return nil
	})
	helper.PanicIfError(err)

	ctx.JSON(http.StatusOK, response.WebResponse{
		Data: helper.ToUserResponse(user),
	})
}

func SignOut(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, response.WebResponse{
		Data: "ok",
	})
}

func SignInWithGoogle(ctx *gin.Context) {
	var userSignInWithGoogleRequest request.UserSignInWithGoogleRequest

	err := ctx.ShouldBind(&userSignInWithGoogleRequest)
	if err != nil {
		ctx.Error(err)
		return
	}

	user := models.User{
		Email:    userSignInWithGoogleRequest.Email,
		FullName: userSignInWithGoogleRequest.FullName,
		Image:    userSignInWithGoogleRequest.Image,
		Role:     userSignInWithGoogleRequest.Role,
	}

	var existingUser models.User
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Take(&existingUser, "email = ?", userSignInWithGoogleRequest.Email).Error

		if existingUser.ID == 0 {
			err = tx.Create(&user).Error
			if err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(http.StatusCreated, response.WebResponse{
		Data: helper.ToUserResponse(existingUser),
	})
}

func CurrentUser(ctx *gin.Context) {
	userFromHeader := helper.ParseHeaderAuthorization(ctx)

	if userFromHeader.ID == 0 {
		ctx.JSON(http.StatusOK, response.WebResponse{
			Data: nil,
		})
	}

	var user models.User
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		tx.Take(&user, "id = ?", userFromHeader.ID)

		return nil
	})
	if err != nil {
		ctx.Error(err)
		return 
	}

	if user.ID == 0 {
		ctx.JSON(http.StatusOK, response.WebResponse{
			Data: nil,
		})
		return
	}

	ctx.JSON(http.StatusOK, response.WebResponse{
		Data: helper.ToUserResponse(user),
	})
}

