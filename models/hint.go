package models

type HintRequest struct {
	Message     string   `json:"message"`
	Location    string   `json:"location"`
	Inventory   []string `json:"inventory"`
	KeyEvidence []string `json:"key_evidence"`
	CurrentCase string   `json:"current_case"`
	Characters  []string `json:"characters"`
	Killer      []string `json:"killer"`
}
type HintRespond struct {
	Reply string `json:"reply"`
}
