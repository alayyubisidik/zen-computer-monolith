package usercontroller

import (
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
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
	userFromHeader, err := helper.ParseHeaderAuthorization(ctx)
	if err != nil {
		ctx.Error(err)
		return
	}

	if userFromHeader.ID == 0 {
		ctx.JSON(http.StatusOK, response.WebResponse{
			Data: nil,
		})
	}

	var user models.User
	err = database.DB.Transaction(func(tx *gorm.DB) error {
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

func Update(ctx *gin.Context) {
	var urlCloudinary = os.Getenv("CLOUDINARY_URL")

	var userUpdateRequest request.UserUpdateRequest

	if err := ctx.ShouldBindWith(&userUpdateRequest, binding.FormMultipart); err != nil {
		ctx.Error(err)
		return
	}

	if userUpdateRequest.Image != nil {
		err := helper.ValidateImageFile(ctx)
		if err != nil {
			ctx.Error(err)
			return
		}
	}

	userId := ctx.Param("userId")
	id, err := strconv.Atoi(userId)
	helper.PanicIfError(err)

	var existingUser models.User
	err = database.DB.Transaction(func(tx *gorm.DB) error {

		if err := tx.Take(&existingUser, "id = ?", id).Error; err != nil {
			return exception.NewNotFoundError("user not found")
		}

		var conflictUser models.User
		err = tx.Where("email = ? AND id != ?", userUpdateRequest.Email, existingUser.ID).First(&conflictUser).Error
		if err == nil {
			return exception.NewConflictError("email is already exists")
		}

		return nil
	})

	if err != nil {
		ctx.Error(err)
		return
	}

	if userUpdateRequest.Image != nil {
		cldService, _ := cloudinary.NewFromURL(urlCloudinary)

		if existingUser.PublicId != "profile-picture/tvrg2tuayakndkpoldqj" {
			cldService.Upload.Destroy(ctx, uploader.DestroyParams{
				PublicID: existingUser.PublicId,
			})
		}

		resp, _ := cldService.Upload.Upload(ctx, userUpdateRequest.Image, uploader.UploadParams{
			Folder: "profile-picture",
		})

		existingUser.Image = resp.SecureURL
		existingUser.PublicId = resp.PublicID
	}

	existingUser.FullName = userUpdateRequest.FullName
	existingUser.Email = userUpdateRequest.Email
	existingUser.PhoneNumber = userUpdateRequest.PhoneNumber
	existingUser.Gender = userUpdateRequest.Gender
	existingUser.DateOfBirth = userUpdateRequest.DateOfBirth

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		err := tx.Save(&existingUser).Error
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.WebResponse{
		Data: helper.ToUserResponse(existingUser),
	})
}

func GetAll(ctx *gin.Context) {
	var users []models.User
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("role != ?", "admin").Find(&users).Error; err != nil {
			return err
		}
		return nil
	})	

	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.WebResponse{
		Data: helper.ToUserResponses(users),
	})
}


func ChangeStatus(ctx *gin.Context) {
	id := ctx.Param("userId")
	userId, err := strconv.Atoi(id)

	log.Print("testsstst")

	var user models.User
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Take(&user, "id = ?", userId).Error; err != nil {
			return exception.NewNotFoundError("User not found")
		}

		if user.Status == "active" {
			user.Status = "blocked"
		} else {
			user.Status = "active"
		}

		if err := tx.Save(&user).Error; err != nil {
			return err 
		}

		return nil
	})

	if err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, response.WebResponse{
		Data: "Change status success!",
	})
}
