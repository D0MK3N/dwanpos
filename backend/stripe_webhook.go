package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"github.com/stripe/stripe-go/v84"
	"github.com/stripe/stripe-go/v84/webhook"
)

func main() {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	http.HandleFunc("/api/stripe/webhook", handleStripeWebhook)
	// ...existing handlers...
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleStripeWebhook(w http.ResponseWriter, r *http.Request) {
	const MaxBodyBytes = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
	payload, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	// STRIPE_WEBHOOK_SECRET dari dashboard Stripe
	secret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	event, err := webhook.ConstructEvent(payload, r.Header.Get("Stripe-Signature"), secret)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if event.Type == "checkout.session.completed" {
		var session stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &session); err == nil {
			log.Printf("[STRIPE_WEBHOOK] Payment success for session: %s, payment_intent: %s", session.ID, session.PaymentIntent.ID)
			// Update status payment di database
			// --- Mulai patch update DB ---
			imported := false
			// Import package jika belum
			// import "saas2/backend/database"
			// import "time"
			var payment database.Payment
			result := database.DB.Where("stripe_payment_intent_id = ?", session.PaymentIntent.ID).First(&payment)
			if result.Error == nil {
				payment.Status = "completed"
				payment.UpdatedAt = time.Now()
				database.DB.Save(&payment)
				// Aktifkan subscription user hanya setelah payment completed
				if payment.Status == "completed" {
					// Nonaktifkan semua subscription lama user ini
					database.DB.Model(&database.Subscription{}).Where("user_id = ?", payment.UserID).Update("is_active", false)
					// Tambahkan subscription baru
					sub := database.Subscription{
						ID:        "sub_" + time.Now().Format("20060102150405"),
						UserID:    payment.UserID,
						PlanType:  payment.PlanID,
						IsActive:  true,
						CreatedAt: time.Now(),
						UpdatedAt: time.Now(),
					}
					database.DB.Create(&sub)
				}
			}
			// --- Selesai patch update DB ---
		}
	}

	w.WriteHeader(http.StatusOK)
}
