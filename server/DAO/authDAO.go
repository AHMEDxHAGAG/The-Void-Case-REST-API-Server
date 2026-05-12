package dao

import (
	"database/sql"
	"github.com/AHMEDxHAGAG/server/models"
)

func CreateSession(db *sql.DB, id string, session string) error {
	query := `insert into sessions (user_id, session_id) values (?, ?)`
	_, err := db.Exec(query, id, session)
	if err != nil {
		return err
	}
	return nil

}

func DeleteSession(db *sql.DB, session string) error {
	query := `delete from sessions where session_id = ?;`
	_, err := db.Exec(query, session)
	if err != nil {
		return err
	}
	return nil
}

func GetID(db *sql.DB, session string) (id string, err error) {
	query := `select user_id from sessions where session_id = ?`
	var s models.Session
	err = db.QueryRow(query, session).Scan(&s.User_id)
	return s.User_id, err
}
