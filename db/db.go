package db

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"log"
)

var Db *sql.DB

func Connect() {
	connectStr := "root:200692@tcp(localhost:3306)/puzzle"
	var err error
	Db, err = sql.Open("mysql", connectStr)
	if err != nil {
		log.Fatal(err)
	}

	if err = Db.Ping(); err != nil {
		log.Fatal(err)
	}
	log.Println("Connected To mysql")
}
