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

	for rows.Next() {
		var datoum models.Contestant
		err := rows.Scan(&datoum.Rank, &datoum.User_id, &datoum.Username, &datoum.Correct_completions, &datoum.Completion_count)
		if err != nil {
			return data, err
		}
		data = append(data, datoum)
	}

	defer rows.Close()
	return data, nil
}

func DBGetMyLeaderboard(db *sql.DB, id string) (models.Contestant, error) {
	query := `SELECT RANK() OVER(order by correct_completions desc, completion_count desc) as rank, user_id, username, correct_completions, completion_count from users order by correct_completions desc, completion_count desc where user_id = ?;`
	var data models.Contestant
	err := db.QueryRow(query, id).Scan(&data.Rank, &data.User_id, &data.Username, &data.Correct_completions, &data.Completion_count)

	if err != nil {
		return data, err
	}

	return data, nil
}
