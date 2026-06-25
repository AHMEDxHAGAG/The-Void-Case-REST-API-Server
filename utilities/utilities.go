// Package utilities
package utilities

import (
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func GenerateUUID() string {
	return uuid.NewString()
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

func ValidatePassword(hashed string, password string) bool {
	if err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(password)); err != nil {
		return false
	}
	return true
}
