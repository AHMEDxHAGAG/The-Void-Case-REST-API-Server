package dao

import (
	"database/sql"
	"github.com/AHMEDxHAGAG/server/models"
)

func DBGetLeaderboard(db *sql.DB) ([]models.Contestant, error) {
	query := `SELECT RANK() OVER(order by correct_completions desc, completion_count desc) as rank, user_id, username, correct_completions, completion_count from users order by correct_completions desc, completion_count desc;`
	var data []models.Contestant
	rows, err := db.Query(query)
	if err != nil {
		return data, err
	}

	defer rows.Close()

	for rows.Next() {
		var datoum models.Contestant
		err := rows.Scan(&datoum.Rank, &datoum.User_id, &datoum.Username, &datoum.Correct_completions, &datoum.Completion_count)
		if err != nil {
			return data, err
		}
		data = append(data, datoum)
	}

	return data, nil
}

func DBGetMyLeaderboard(db *sql.DB, id string) (models.Contestant, error) {
	query := `SELECT RANK() OVER(order by correct_completions desc, completion_count desc) as rank, user_id, username, correct_completions, completion_count from users order by correct_completions desc, completion_count desc;`
	var dnil models.Contestant
	rows, err := db.Query(query)

	if err != nil {
		return dnil, err
	}

	defer rows.Close()

	for rows.Next() {
		var datoum models.Contestant
		err := rows.Scan(&datoum.Rank, &datoum.User_id, &datoum.Username, &datoum.Correct_completions, &datoum.Completion_count)
		if err != nil {
			return datoum, err
		}
		if datoum.User_id == id {
			return datoum, nil
		}
	}

	return dnil, err
}
