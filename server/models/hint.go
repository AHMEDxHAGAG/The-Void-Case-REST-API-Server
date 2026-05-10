package models

type HintRequest struct {
	Message      string   `json:"message"`
	Location     string   `json:"location"`
	Inventory    []string `json:"inventory"`
	Key_evidence []string `json:"key_evidence"`
	Current_case string   `json:"current_case"`
	Characters   []string `json:"characters"`
	Killer       []string `json:"killer"`
}
type HintRespond struct {
	Reply string `json:"reply"`
}
