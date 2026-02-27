package handlers

import (
	"log"
	"net/http"
	"time"

	"saas2/backend/database"
	"saas2/backend/utils"

	"github.com/gin-gonic/gin"
)

// Stripe webhook handlers

type StripeWebhookSuccessRequest struct {
	StripePaymentIntentID string                 `json:"stripe_payment_intent_id"`
	UserID                string                 `json:"user_id"`
	Amount                float64                `json:"amount"`
	Currency              string                 `json:"currency"`
	Status                string                 `json:"status"`
	PlanType              string                 `json:"plan_type"`
	Metadata              map[string]interface{} `json:"metadata"`
}

type StripeWebhookFailedRequest struct {
	StripePaymentIntentID string `json:"stripe_payment_intent_id"`
	UserID                string `json:"user_id"`
	Status                string `json:"status"`
	ErrorMessage          string `json:"error_message"`
}

type StripeWebhookCanceledRequest struct {
	StripePaymentIntentID string `json:"stripe_payment_intent_id"`
	UserID                string `json:"user_id"`
	Status                string `json:"status"`
}

type StripeWebhookRefundedRequest struct {
	ChargeID        string  `json:"charge_id"`
	PaymentIntentID string  `json:"payment_intent_id"`
	AmountRefunded  float64 `json:"amount_refunded"`
	Status          string  `json:"status"`
}

// HandleStripeWebhookSuccess - Webhook untuk payment success dari Stripe
func HandleStripeWebhookSuccess(c *gin.Context) {
		log.Printf("[GIN-debug] %s %s", c.Request.Method, c.FullPath())
	var req StripeWebhookSuccessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Invalid Stripe webhook success request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid request data",
		})
		return
	}

	log.Printf("Processing Stripe payment success: %s", req.StripePaymentIntentID)

	// Check if payment already exists
	var existingPayment database.Payment
	result := database.DB.Where("stripe_payment_intent_id = ?", req.StripePaymentIntentID).First(&existingPayment)

	if result.Error == nil {
		// Payment exists, update status
		if existingPayment.Status != "completed" {
			existingPayment.Status = "completed"
			existingPayment.UpdatedAt = time.Now()
			database.DB.Save(&existingPayment)
		}
	} else {
		// Create new payment record
		payment := database.Payment{
			ID:                    utils.GeneratePaymentID(),
			UserID:                req.UserID,
			PlanID:                req.PlanType,
			Amount:                req.Amount,
			Currency:              req.Currency,
			PaymentMethod:         "stripe",
			Status:                "completed",
			StripePaymentIntentID: req.StripePaymentIntentID,
			CreatedAt:             time.Now(),
			UpdatedAt:             time.Now(),
		}

		if err := database.DB.Create(&payment).Error; err != nil {
			log.Printf("Failed to create payment record: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   true,
				"message": "Failed to save payment record",
			})
			return
		}

		// Activate subscription
		database.ActivateUserSubscription(payment.UserID, payment.PlanID, payment.ID)
		log.Printf("Created new payment: %s", payment.ID)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment processed successfully",
	})
}

// HandleStripeWebhookFailed - Webhook untuk payment failed dari Stripe
func HandleStripeWebhookFailed(c *gin.Context) {
		log.Printf("[GIN-debug] %s %s", c.Request.Method, c.FullPath())
	var req StripeWebhookFailedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Invalid Stripe webhook failed request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid request data",
		})
		return
	}

	log.Printf("Processing Stripe payment failed: %s", req.StripePaymentIntentID)

	var payment database.Payment
	if err := database.DB.Where("stripe_payment_intent_id = ?", req.StripePaymentIntentID).First(&payment).Error; err != nil {
		log.Printf("Payment not found: %s", req.StripePaymentIntentID)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Payment not found",
		})
		return
	}

	payment.Status = "failed"
	payment.UpdatedAt = time.Now()
	database.DB.Save(&payment)

	log.Printf("Payment marked as failed: %s", payment.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment status updated",
	})
}

// HandleStripeWebhookCanceled - Webhook untuk payment canceled dari Stripe
func HandleStripeWebhookCanceled(c *gin.Context) {
		log.Printf("[GIN-debug] %s %s", c.Request.Method, c.FullPath())
	var req StripeWebhookCanceledRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Invalid Stripe webhook canceled request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid request data",
		})
		return
	}

	log.Printf("Processing Stripe payment canceled: %s", req.StripePaymentIntentID)

	var payment database.Payment
	if err := database.DB.Where("stripe_payment_intent_id = ?", req.StripePaymentIntentID).First(&payment).Error; err != nil {
		log.Printf("Payment not found: %s", req.StripePaymentIntentID)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Payment not found",
		})
		return
	}

	payment.Status = "canceled"
	payment.UpdatedAt = time.Now()
	database.DB.Save(&payment)

	log.Printf("Payment marked as canceled: %s", payment.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment status updated",
	})
}

// HandleStripeWebhookRefunded - Webhook untuk payment refunded dari Stripe
func HandleStripeWebhookRefunded(c *gin.Context) {
		log.Printf("[GIN-debug] %s %s", c.Request.Method, c.FullPath())
	var req StripeWebhookRefundedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Invalid Stripe webhook refunded request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid request data",
		})
		return
	}

	log.Printf("Processing Stripe payment refunded: %s", req.PaymentIntentID)

	var payment database.Payment
	if err := database.DB.Where("stripe_payment_intent_id = ?", req.PaymentIntentID).First(&payment).Error; err != nil {
		log.Printf("Payment not found: %s", req.PaymentIntentID)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Payment not found",
		})
		return
	}

	payment.Status = "refunded"
	payment.UpdatedAt = time.Now()
	database.DB.Save(&payment)

	// Deactivate subscription
	var subscription database.Subscription
	if err := database.DB.Where("payment_id = ?", payment.ID).First(&subscription).Error; err == nil {
		subscription.IsActive = false
		subscription.UpdatedAt = time.Now()
		database.DB.Save(&subscription)
		log.Printf("Subscription deactivated for payment: %s", payment.ID)
	}

	log.Printf("Payment marked as refunded: %s", payment.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment refunded and subscription deactivated",
	})
}

