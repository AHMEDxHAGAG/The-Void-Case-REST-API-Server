package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/AHMEDxHAGAG/server/db"
	"github.com/AHMEDxHAGAG/server/handlers"
)

func main() {
	db.Connect()
	defer func() {
		_ = db.DB.Close()
	}()
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/users/{id}", handlers.GetUser)
	mux.HandleFunc("GET /api/users/me", handlers.GetUserMe)
	mux.HandleFunc("GET /api/users/", handlers.GetAllUsers)
	mux.HandleFunc("DELETE /api/users/me", handlers.DeleteUser)
	mux.HandleFunc("PUT /api/users/me", handlers.UpdateUser)
	mux.HandleFunc("POST /api/users/me", handlers.Signup)

	mux.HandleFunc("POST /api/auth/signup", handlers.Signup)
	mux.HandleFunc("POST /api/auth/login", handlers.Login)
	mux.HandleFunc("POST /api/auth/logout", handlers.Logout)

	mux.HandleFunc("GET /api/leaderboard", handlers.Leaderboard)
	mux.HandleFunc("GET /api/leaderboard/me", handlers.LeaderboardMe)

	mux.HandleFunc("GET /api/save", handlers.GetSaveGame)
	mux.HandleFunc("POST /api/save", handlers.CreateSaveGame)
	mux.HandleFunc("PUT /api/save", handlers.UpdateSaveGame)

	mux.HandleFunc("POST /api/hint", handlers.CreateHint)

	fmt.Println("Server Listening on Port :8080")

	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatal(err)
	}
}
