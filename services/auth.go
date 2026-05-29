package services

import (
	"database/sql"
	"github.com/AHMEDxHAGAG/server/DAO"
	"github.com/AHMEDxHAGAG/server/db"
)

func EmailDuplicated(email string) bool {
	_, _, err := dao.DBSearchUserByEmail(db.Db, email)
	if err == sql.ErrNoRows {
		return false
	} else {
		return true
	}
}
