// Package models
package models

import "time"

type User struct {
	UserID             string    `json:"user_id"`
	Username           string    `json:"username"`
	Email              string    `json:"email"`
	HashedPassword     string    `json:"-"`
	SaveData           []byte    `json:"save_data"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
	Completed          bool      `json:"completed"`
	CompletionCount    int       `json:"completion_count"`
	CorrectCompletions int       `json:"correct_completions"`
}
