// Package db
package db

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func Connect() {
	connectStr := "root:200692@tcp(localhost:3306)/puzzle"
	var err error
	DB, err = sql.Open("mysql", connectStr)
	if err != nil {
		log.Fatal(err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal(err)
	}
	log.Println("Connected To mysql")
}
