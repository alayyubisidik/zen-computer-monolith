package request

type UserSignInWithGoogleRequest struct {
	Email    string `form:"email" json:"email"`
	FullName string `form:"full_name" json:"full_name"`
	Image    string `form:"image" json:"image"`
	Role     string `form:"role" json:"role"`
}
