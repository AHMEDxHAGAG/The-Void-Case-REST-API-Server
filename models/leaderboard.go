package models

type Contestant struct {
	Rank               int    `json:"rank"`
	UserID             string `json:"user_id"`
	Username           string `json:"username"`
	CorrectCompletions int    `json:"correct_completions"`
	CompletionCount    int    `json:"completion_count"`
}
