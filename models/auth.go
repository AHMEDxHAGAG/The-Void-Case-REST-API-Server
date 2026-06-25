package models

type Session struct {
	UserID    string `json:"user_id"`
	SessionID string `json:"session_id"`
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
