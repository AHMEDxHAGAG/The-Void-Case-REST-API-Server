package dao

import (
	"database/sql"
	"github.com/AHMEDxHAGAG/server/models"
)

func DBGetLeaderboard(db *sql.DB) ([]models.Contestant, error) {
	// This Query is Placeholder
	query := `SELECT user_id, username, correct_completions, completion_count from users;`

	var data []models.Contestant
	rows, err := db.Query(query)

	if err != nil {
		return data, err
	}

	counter := 0
	for rows.Next() {
		var datoum models.Contestant
		err := rows.Scan(&datoum.User_id, &datoum.Username, &datoum.Correct_completions, &datoum.Completion_count)
		if err != nil {
			return data, err
		}
		datoum.Rank = counter
		data = append(data, datoum)
		counter++
	}

	defer rows.Close()
	return data, nil
}

func DBGetMyLeaderboard(db *sql.DB, id string) (models.Contestant, error) {
	// This Query is Placeholder
	query := `SELECT user_id, username, correct_completions, completion_count from users;`

	var data models.Contestant
	rows, err := db.Query(query)

	if err != nil {
		return data, err
	}

	counter := 0
	for rows.Next() {
		var datoum models.Contestant
		err := rows.Scan(&datoum.User_id, &datoum.Username, &datoum.Correct_completions, &datoum.Completion_count)
		if err != nil {
			return data, err
		}
		datoum.Rank = counter
		if datoum.User_id == id {
			data = datoum
			break
		}
		counter++
	}

	defer rows.Close()
	return data, nil
}
