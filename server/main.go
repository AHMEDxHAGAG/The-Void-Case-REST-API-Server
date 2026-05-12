package main

import (
	"fmt"
	"github.com/AHMEDxHAGAG/server/db"
	"github.com/AHMEDxHAGAG/server/handlers"
	"net/http"
)

func main() {
	db.Connect()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/users/{id}", handlers.GetUser)
	mux.HandleFunc("GET /api/users/me", handlers.GetUserMe)
	mux.HandleFunc("GET /api/users/", handlers.GetAllUsers)
	mux.HandleFunc("DELETE /api/users/", handlers.DeleteUser)
	mux.HandleFunc("POST /api/users/", handlers.UpdateUser)
	mux.HandleFunc("PUT /api/users/", handlers.CreateUser)

	mux.HandleFunc("POST /api/auth/signup", handlers.Signup)
	mux.HandleFunc("POST /api/auth/login", handlers.Login)
	mux.HandleFunc("POST /api/auth/logout", handlers.Logout)
	mux.HandleFunc("GET /api/auth/me", handlers.GetSessionMe)

	mux.HandleFunc("GET /api/leaderboard", handlers.Leaderboard)
	mux.HandleFunc("GET /api/leaderboard/me", handlers.LeaderboardMe)

	mux.HandleFunc("GET /api/save", handlers.GetSaveGame)
	mux.HandleFunc("POST /api/save", handlers.CreateSaveGame)
	mux.HandleFunc("PUT /api/save", handlers.UpdateSaveGame)

	mux.HandleFunc("POST /api/hint", handlers.CreateHint)

	fmt.Println("Server Listeneing on Port :8080")

	http.ListenAndServe(":8080", mux)

	defer db.Db.Close()
}
