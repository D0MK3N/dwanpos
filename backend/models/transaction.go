package models

import (
	"time"
)

type Transaction struct {
	ID          string         `gorm:"primaryKey;type:varchar(255)" json:"id"`
	UserID      string         `gorm:"not null;type:varchar(255)" json:"user_id"`
	Total       float64        `gorm:"not null;type:decimal(10,2)" json:"total"`
	Cash        float64        `gorm:"not null;type:decimal(10,2)" json:"cash"`
	Change      float64        `gorm:"not null;type:decimal(10,2)" json:"change"`
	Status      string         `gorm:"type:varchar(20);default:'paid'" json:"status"` // paid, pending, cancelled, refunded
	OrderType   string         `gorm:"type:varchar(20)" json:"order_type"` // Dine-in, Takeaway, Delivery
	TableNumber string         `gorm:"type:varchar(20)" json:"table_number,omitempty"` // untuk Dine-in
	OrderNote   string         `gorm:"type:text" json:"order_note,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Items       []TransactionItem `gorm:"foreignKey:TransactionID" json:"items"`
}

type TransactionItem struct {
	ID            string  `gorm:"primaryKey;type:varchar(255)" json:"id"`
	TransactionID string  `gorm:"not null;type:varchar(255);index" json:"transaction_id"`
	ProductID     string  `gorm:"not null;type:varchar(255)" json:"product_id"`
	ProductName   string  `gorm:"not null;type:varchar(255)" json:"product_name"`
	Price         float64 `gorm:"not null;type:decimal(10,2)" json:"price"`
	Qty           int     `gorm:"not null" json:"qty"`
	Subtotal      float64 `gorm:"not null;type:decimal(10,2)" json:"subtotal"`
}
