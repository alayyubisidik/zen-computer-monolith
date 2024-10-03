package request

type UserSignInRequest struct {
	Email    string `form:"email" json:"email"`
	Password string `form:"password" json:"password"`
}
