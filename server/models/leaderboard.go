package models

type Contestant struct {
	Rank                int    `json:"rank"`
	User_id             string `json:"user_id"`
	Username            string `json:"username"`
	Correct_completions int    `json:"correct_completions"`
	Completion_count    int    `json:"completion_count"`
}
