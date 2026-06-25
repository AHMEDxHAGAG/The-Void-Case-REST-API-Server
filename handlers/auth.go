// Package handlers
package handlers

import (
	"encoding/json"
	"net/http"

	dao "github.com/AHMEDxHAGAG/server/DAO"
	"github.com/AHMEDxHAGAG/server/db"
	"github.com/AHMEDxHAGAG/server/models"
	"github.com/AHMEDxHAGAG/server/services"
	"github.com/AHMEDxHAGAG/server/utilities"
)

func Login(w http.ResponseWriter, r *http.Request) {
	var auth models.Loginer
	err := json.NewDecoder(r.Body).Decode(&auth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	id, hashedpass, err := dao.DBSearchUserByEmail(db.DB, auth.Email)
	if err != nil {
		http.Error(w, "Wrong Email or Password, Try Again Later", http.StatusUnauthorized)
		return
	}
	if !utilities.ValidatePassword(hashedpass, auth.Password) {
		http.Error(w, "Wrong Email or Password, Try Again Later", http.StatusUnauthorized)
		return
	}

	session := utilities.GenerateUUID()
	err = dao.CreateSession(db.DB, id, session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	cookie := http.Cookie{
		Name:     "session_id",
		Value:    session,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
	}
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func Signup(w http.ResponseWriter, r *http.Request) {
	var auth models.Signuper
	err := json.NewDecoder(r.Body).Decode(&auth)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if services.EmailDuplicated(auth.Email) {
		http.Error(w, "Email already avaliable, login instead", http.StatusBadRequest)
		return
	}

	hashedPassword, err := utilities.HashPassword(auth.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	user := models.User{
		CorrectCompletions: 0,
		Completed:          false,
		Email:              auth.Email,
		Username:           auth.Username,
		UserID:             utilities.GenerateUUID(),
		HashedPassword:     hashedPassword,
	}

	err = dao.DBCreateUser(db.DB, user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	session := utilities.GenerateUUID()
	err = dao.CreateSession(db.DB, user.UserID, session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	cookie := http.Cookie{
		Name:     "session_id",
		Value:    session,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
	}
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "You Need To Login/Signup", http.StatusForbidden)
		return
	}
	session := c.Value
	err = dao.DeleteSession(db.DB, session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	cookie := http.Cookie{
		Name:     "session_id",
		Value:    session,
		MaxAge:   -1,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
	}
	http.SetCookie(w, &cookie)
	w.WriteHeader(http.StatusOK)
}
