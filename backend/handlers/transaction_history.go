
package handlers

import (
	"log"
	"time"
)

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"saas2/backend/database"
	"saas2/backend/models"
)

// Ambil riwayat transaksi berdasarkan user_id (atau semua jika admin)
func GetTransactionHistory(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	userID := c.Query("user_id")
	var trxs []models.Transaction
	query := database.DB.Preload("Items").Order("created_at DESC")
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.Find(&trxs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil riwayat transaksi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": trxs})
}
