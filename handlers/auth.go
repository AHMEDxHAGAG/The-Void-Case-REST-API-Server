package handlers

import (
	"encoding/json"
	"github.com/AHMEDxHAGAG/server/DAO"
	"github.com/AHMEDxHAGAG/server/db"
	"github.com/AHMEDxHAGAG/server/models"
	"github.com/AHMEDxHAGAG/server/services"
	"github.com/AHMEDxHAGAG/server/utilities"
	"net/http"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var auth models.Loginer
	err := json.NewDecoder(r.Body).Decode(&auth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	session := utilities.GenerateUUId()
	id, hashedpass, err := dao.DBSearchUserByEmail(db.Db, auth.Email)
	if err != nil {
		http.Error(w, "Non Registered Email in the Database, try to signup", http.StatusForbidden)
		return
	}
	if !utilities.ValidatePassword(hashedpass, auth.Password) {
		http.Error(w, "Wrong Password", http.StatusForbidden)
		return
	}
	err = dao.CreateSession(db.Db, id, session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	cookie := http.Cookie{
		Name:   "session_id",
		Value:  session,
		Path:   "/",
		Secure: true,
	}
	http.SetCookie(w, &cookie)
}

func Signup(w http.ResponseWriter, r *http.Request) {
	var auth models.Signuper
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&auth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	user.Correct_completions = 0
	user.Completion_count = 0
	user.Completed = false

	if services.EmailDuplicated(auth.Email) {
		http.Error(w, "Email already avaliable, login instead", http.StatusBadRequest)
		return
	}
	user.Email = auth.Email
	user.Username = auth.Username
	user.User_id = utilities.GenerateUUId()
	user.Hashed_password, err = utilities.HashPassword(auth.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	err = dao.DBCreateUser(db.Db, user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	session := utilities.GenerateUUId()
	err = dao.CreateSession(db.Db, user.User_id, session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	cookie := http.Cookie{
		Name:   "session_id",
		Value:  "session",
		Path:   "/",
		Secure: true,
	}
	http.SetCookie(w, &cookie)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "You Need To Login/Signup", http.StatusForbidden)
		return
	}
	session := c.Value
	err = dao.DeleteSession(db.Db, session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	cookie := http.Cookie{
		Name:   "session_id",
		Value:  utilities.GenerateUUId(),
		MaxAge: -1,
		Path:   "/",
		Secure: true,
	}
	http.SetCookie(w, &cookie)
}
