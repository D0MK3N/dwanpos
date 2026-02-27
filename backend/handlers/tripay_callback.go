package handlers

import (
	"log"
	"net/http"
	"saas2/backend/database"
	"github.com/gin-gonic/gin"
		"time"
)

// Tripay callback handler
func TripayCallbackHandler(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	var callbackData map[string]interface{}
	if err := c.ShouldBindJSON(&callbackData); err != nil {
		log.Printf("[TRIPAY_CALLBACK] Invalid JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "message": "Invalid callback data"})
		return
	}
	log.Printf("[TRIPAY_CALLBACK] Callback received: %v", callbackData)
	       // TODO: Validate signature (optional, for security)
	       // Update payment status in DB
	       merchantRef, _ := callbackData["merchant_ref"].(string)
	       status, _ := callbackData["status"].(string)
	       if merchantRef != "" && status != "" {
		       // Update payment in DB
		       err := database.UpdatePaymentStatusByInvoice(merchantRef, status)
		       if err != nil {
			       log.Printf("[TRIPAY_CALLBACK] Failed to update payment: %v", err)
			       c.JSON(http.StatusInternalServerError, gin.H{"error": true, "message": "Failed to update payment"})
			       return
		       }
		       log.Printf("[TRIPAY_CALLBACK] Payment %s updated to %s", merchantRef, status)
	       }
	       c.JSON(http.StatusOK, gin.H{"success": true})
}
