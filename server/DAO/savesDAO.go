package dao

import (
	"database/sql"
)

func CreateSaveGame(db *sql.DB, id string) error {
	query := `update users set save_data = ? where user_id = ?`
	intial := `{
  "currentLocation": "basement",
  "collectedEvidence": [],
  "visitedLocations": [],
  "suspectsTalked": [],
  "pins": {},
  "contradictionsTriggered": [],
  "trialProgress": 0,
  "gamePhase": "intro"
	}`
	_, err := db.Exec(query, intial, id)
	return err
}

func DBGetSaveGame(db *sql.DB, id string) ([]byte, error) {
	query := `SELECT save_data from users where user_id = ?;`
	var data []byte
	err := db.QueryRow(query, id).Scan(&data)
	return data, err
}

func UpdateSaveGame(db *sql.DB, id string, data string) error {
	query := `update users set save_data = ? where user_id = ?`
	_, err := db.Exec(query, data, id)
	return err
}
