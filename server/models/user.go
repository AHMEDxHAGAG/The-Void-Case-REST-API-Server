package models

import "time"

type User struct {
	User_id             string    `json:"user_id"`
	Username            string    `json:"username"`
	Email               string    `json:"email"`
	Hashed_password     string    `json:"hashed_password"`
	Save_data           []byte    `json:"save_data"`
	Created_at          time.Time `json:"created_at"`
	Updated_at          time.Time `json:"updated_at"`
	Completed           bool      `json:"completed"`
	Completion_count    int       `json:"completion_count"`
	Correct_completions int       `json:"correct_completions"`
}
