package handlers

import (
	"database/sql"
	"encoding/json"
	"github.com/AHMEDxHAGAG/server/DAO"
	"github.com/AHMEDxHAGAG/server/db"
	"github.com/AHMEDxHAGAG/server/models"
	"net/http"
)

func GetUser(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var respond models.User

	respond, err := dao.DBGetUser(db.Db, id)

	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")

	j, err := json.Marshal(respond)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(j)

}

func GetUserMe(w http.ResponseWriter, r *http.Request) {

	var respond models.User
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
	respond, err = dao.DBGetUser(db.Db, theid)

	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")

	j, err := json.Marshal(respond)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(j)

}

func GetAllUsers(w http.ResponseWriter, r *http.Request) {

	var respond []models.User

	respond, err := dao.DBGetAllUsers(db.Db)

	if err != nil {
		if err == sql.ErrNoRows {
			http.NotFound(w, r)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")

	j, err := json.Marshal(respond)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(j)

}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "You Need To Login/Signup", http.StatusForbidden)
		return
	}

	var request models.User
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

	err = dao.DBUpdateUser(db.Db, request, theid)
	if err != nil {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
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

	err = dao.DBDeleteUser(db.Db, theid)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
