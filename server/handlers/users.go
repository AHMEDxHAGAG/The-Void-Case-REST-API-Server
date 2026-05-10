package handlers

import (
	"database/sql"
	"encoding/json"
	"github.com/AHMEDxHAGAG/server/DAO"
	"github.com/AHMEDxHAGAG/server/db"
	"github.com/AHMEDxHAGAG/server/models"
	"github.com/AHMEDxHAGAG/server/utilities"
	"log"
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

func GetAllUsers(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	var respond []models.User

	respond, err := dao.DBGetAllUsers(db.Db, id)

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

func CreateUser(w http.ResponseWriter, r *http.Request) {

	var request models.User
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusNoContent)
	if request.User_id != "" {
		http.Error(w, "User is Already Created", http.StatusBadRequest)
		return
	}
	request.User_id = utilities.GenerateUUId()
	request.Hashed_password, err = utilities.HashPassword(request.Hashed_password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	err = dao.DBCreateUser(db.Db, request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var request models.User
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	err = dao.DBUpdateUser(db.Db, request, id)
	if err != nil {
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	err := dao.DBDeleteUser(db.Db, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf(`User_ID: %v, Deleted\n`, id)
	w.WriteHeader(http.StatusNoContent)
}
