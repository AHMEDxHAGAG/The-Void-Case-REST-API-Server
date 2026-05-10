package handlers

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/AHMEDxHAGAG/server/models"
)

var gameMutex sync.RWMutex

func CreateCompletion(w http.ResponseWriter, r *http.Request) {

	var request models.CompleteRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)

	gameMutex.Lock()
	// DatabaseLogic is Here
	gameMutex.Unlock()

}
