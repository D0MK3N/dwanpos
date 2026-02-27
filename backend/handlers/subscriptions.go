
package handlers

import "log"

import (
  "net/http"
  "time"

  "github.com/gin-gonic/gin"
  "saas2/backend/database"
)

// GET /subscriptions?user_id=xxx
func GetUserSubscriptions(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	userID := c.Query("user_id")
	var subs []database.Subscription
	query := database.DB
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if err := query.Order("created_at desc").Find(&subs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch subscriptions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": subs})
}

// POST /subscriptions
func CreateUserSubscription(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	var req struct {
		OrderId    string    `json:"orderId"`
		Plan       string    `json:"plan"`
		Status     string    `json:"status"`
		ActivatedAt string   `json:"activatedAt"`
		UserId     string    `json:"userId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	// Nonaktifkan semua subscription lama user ini
	database.DB.Model(&database.Subscription{}).Where("user_id = ?", req.UserId).Update("is_active", false)
	// Tambahkan subscription baru
	sub := database.Subscription{
		ID:        "sub_" + time.Now().Format("20060102150405"),
		UserID:    req.UserId,
		PlanType:  req.Plan,
		IsActive:  true,
		// PaymentID removed
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if req.ActivatedAt != "" {
		if t, err := time.Parse(time.RFC3339, req.ActivatedAt); err == nil {
			sub.CreatedAt = t
			sub.UpdatedAt = t
		}
	}
	if err := database.DB.Create(&sub).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save subscription"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "subscription": sub})
}
