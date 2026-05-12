package models

type Session struct {
	User_id       string `json:"user_id"`
	Session_Token string `json:"session"`
}
