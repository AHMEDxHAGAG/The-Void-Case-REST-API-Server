package models

type Session struct {
	User_id    string `json:"user_id"`
	Session_id string `json:"session_id"`
}

type Loginer struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Signuper struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}
