// Package services
package services

import (
	"database/sql"

	dao "github.com/AHMEDxHAGAG/server/DAO"
	"github.com/AHMEDxHAGAG/server/db"
)

func EmailDuplicated(email string) bool {
	_, _, err := dao.DBSearchUserByEmail(db.DB, email)
	if err == sql.ErrNoRows {
		return false
	} else {
		return true
	}
}
