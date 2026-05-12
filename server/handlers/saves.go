package handlers

import (
	"database/sql"
	"encoding/json"
	"github.com/AHMEDxHAGAG/server/DAO"
	"github.com/AHMEDxHAGAG/server/db"
	"net/http"
)

func GetSaveGame(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "You Need To Login/Signup", http.StatusForbidden)
		return
	}
	theid, err := dao.GetID(db.Db, cookie.Value)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	respond, err := dao.DBGetSaveGame(db.Db, theid)

	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")

	j := respond

	w.WriteHeader(http.StatusOK)
	w.Write(j)

}

func CreateSaveGame(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "You Need To Login/Signup", http.StatusForbidden)
		return
	}
	theid, err := dao.GetID(db.Db, cookie.Value)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = dao.CreateSaveGame(db.Db, theid)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func UpdateSaveGame(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "You Need To Login/Signup", http.StatusForbidden)
		return
	}

	var request string
	err = json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	theid, err := dao.GetID(db.Db, cookie.Value)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = dao.UpdateSaveGame(db.Db, theid, request)
	if err != nil {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
