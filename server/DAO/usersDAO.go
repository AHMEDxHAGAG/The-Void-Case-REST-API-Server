package dao

import (
	"database/sql"
	"github.com/AHMEDxHAGAG/server/models"
)

func DBCreateUser(db *sql.DB, user models.User) error {
	query := `insert into users (user_id, username, email, hashed_password, save_data, created_at, updated_at, completed, completion_count, correct_completions) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := db.Exec(query, user.User_id, user.Username, user.Email, user.Hashed_password, user.Save_data, user.Created_at, user.Updated_at, user.Completed, user.Completion_count, user.Correct_completions)
	if err != nil {
		return err
	}
	return nil
}

func DBGetUser(db *sql.DB, id string) (models.User, error) {
	query := `SELECT user_id, username, save_data, created_at, updated_at, completed, completion_count, correct_completions from users where user_id = ?;`
	var user models.User
	err := db.QueryRow(query, id).Scan(&user.User_id, &user.Username, &user.Save_data, &user.Created_at, &user.Updated_at, &user.Completed, &user.Completion_count, &user.Correct_completions)
	if err != nil {
		return user, err
	}
	return user, nil
}

func DBGetAllUsers(db *sql.DB) ([]models.User, error) {
	query := `SELECT user_id, username, save_data, created_at, updated_at, completed, completion_count, correct_completions from users;`

	var users []models.User

	rows, err := db.Query(query)
	if err != nil {
		return users, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.User_id, &user.Username, &user.Save_data, &user.Created_at, &user.Updated_at, &user.Completed, &user.Completion_count, &user.Correct_completions); err != nil {
			return users, nil
		}
		users = append(users, user)
	}
	return users, nil
}

func DBUpdateUser(db *sql.DB, user models.User, id string) error {
	query := `update users set username = ?, email = ? where user_id = ?`
	_, err := db.Exec(query, user.Username, user.Email, user.User_id)
	return err
}

func DBDeleteUser(db *sql.DB, id string) error {
	query := `delete from users where user_id = ?;`
	_, err := db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
