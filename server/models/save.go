package models

type Save struct {
	CurrentLocation         string   `json:"currentLocation"`
	CollectedEvidence       []string `json:"collectedEvidence"`
	VisitedLocations        []string `json:"visitedLocations"`
	SuspectsTalked          []string `json:"suspectsTalked"`
	Pins                    []byte   `json:"pins"`
	ContradictionsTriggered []int    `json:"contradictionsTriggered"`
	TrialProgress           int      `json:"trialProgress"`
	GamePhase               string   `json:"gamePhase"`
}
