package models

type CompleteRequest struct {
	AccusedSuspect   string   `json:"accusedSuspect"`
	GotCorrectEnding bool     `json:"gotCorrectEnding"`
	MissedClues      []string `json:"missedClues"`
}
type CompleteRespond struct {
	Recommendations []string `json:"recommendations"`
}
