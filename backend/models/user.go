package models

import (
    "golang.org/x/crypto/bcrypt"
    "time"
)

type User struct {
    ID               string `gorm:"primaryKey;type:varchar(64)" json:"id"`
    Name             string `gorm:"not null" json:"name"`
    Email            string `gorm:"uniqueIndex;not null" json:"email"`
    Password         string `gorm:"not null" json:"-"`
    ApiKeyProduct    string `gorm:"type:varchar(255)" json:"api_key_product"`
    ApiKeyCategory   string `gorm:"type:varchar(255)" json:"api_key_category"`
    ApiKeyTransaction string `gorm:"type:varchar(255)" json:"api_key_transaction"`
    CreatedAt        *time.Time `json:"created_at"`
    UpdatedAt        *time.Time `json:"updated_at"`
    DeletedAt        *time.Time `gorm:"index" json:"deleted_at"`
}

func (u *User) HashPassword(password string) error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    u.Password = string(hashedPassword)
    return nil
}

func (u *User) CheckPassword(password string) error {
    return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
}