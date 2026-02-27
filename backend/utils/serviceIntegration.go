package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// ServiceClient untuk komunikasi antar backend services
type ServiceClient struct {
	StripeBackendURL string
	Timeout          time.Duration
	Client           *http.Client
}

// Response types
type ServiceResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Code    int         `json:"code"`
}

type PaymentUpdateRequest struct {
	OrderID     string `json:"orderId"`
	PaymentID   string `json:"paymentId"`
	Status      string `json:"status"`
	Amount      float64 `json:"amount"`
	Currency    string `json:"currency"`
	UserID      string `json:"userId"`
	Method      string `json:"method"`
	RawBody     string `json:"rawBody,omitempty"`
}

type SubscriptionActivateRequest struct {
	UserID          string `json:"userId"`
	SubscriptionID  string `json:"subscriptionId"`
	Plan            string `json:"plan"`
	Status          string `json:"status"`
	StartDate       string `json:"startDate"`
	EndDate         string `json:"endDate"`
	PaymentMethod   string `json:"paymentMethod"`
}

// NewServiceClient membuat service client baru
func NewServiceClient() *ServiceClient {
	stripeBackendURL := os.Getenv("STRIPE_BACKEND_URL")
	if stripeBackendURL == "" {
		stripeBackendURL = "http://localhost:4242"
	}

	return &ServiceClient{
		StripeBackendURL: stripeBackendURL,
		Timeout:          30 * time.Second,
		Client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// SendPaymentUpdate mengirim update payment ke Stripe backend
func (sc *ServiceClient) SendPaymentUpdate(req PaymentUpdateRequest) (*ServiceResponse, error) {
	url := fmt.Sprintf("%s/api/payment/update", sc.StripeBackendURL)
	return sc.sendRequest("POST", url, req)
}

// NotifyPaymentSuccess memberitahu payment berhasil ke Stripe backend
func (sc *ServiceClient) NotifyPaymentSuccess(orderID, paymentID string, amount float64) (*ServiceResponse, error) {
	req := PaymentUpdateRequest{
		OrderID:   orderID,
		PaymentID: paymentID,
		Status:    "COMPLETED",
		Amount:    amount,
		Currency:  "USD",
		Method:    "paypal",
	}
	return sc.SendPaymentUpdate(req)
}

// NotifyPaymentFailed memberitahu payment gagal ke Stripe backend
func (sc *ServiceClient) NotifyPaymentFailed(orderID, paymentID string) (*ServiceResponse, error) {
	req := PaymentUpdateRequest{
		OrderID:   orderID,
		PaymentID: paymentID,
		Status:    "FAILED",
		Method:    "paypal",
	}
	return sc.SendPaymentUpdate(req)
}

// ActivateSubscription mengaktifkan subscription di Stripe backend
func (sc *ServiceClient) ActivateSubscription(req SubscriptionActivateRequest) (*ServiceResponse, error) {
	url := fmt.Sprintf("%s/api/subscription/activate", sc.StripeBackendURL)
	return sc.sendRequest("POST", url, req)
}

// VerifyStripeWebhook memverifikasi webhook signature dari Stripe
func (sc *ServiceClient) VerifyStripeWebhook(signature string, body []byte) (bool, error) {
	url := fmt.Sprintf("%s/api/webhook/verify", sc.StripeBackendURL)
	
	req := map[string]interface{}{
		"signature": signature,
		"body":      string(body),
	}

	resp, err := sc.sendRequest("POST", url, req)
	if err != nil {
		return false, err
	}

	return resp.Success, nil
}

// GetStripePaymentStatus mengambil status payment dari Stripe backend
func (sc *ServiceClient) GetStripePaymentStatus(paymentID string) (map[string]interface{}, error) {
	url := fmt.Sprintf("%s/api/payment/%s", sc.StripeBackendURL, paymentID)
	resp, err := sc.sendRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	data := resp.Data.(map[string]interface{})
	return data, nil
}

// HealthCheck mengecek kesehatan Stripe backend
func (sc *ServiceClient) HealthCheck() (bool, error) {
	url := fmt.Sprintf("%s/health", sc.StripeBackendURL)
	resp, err := http.Get(url)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	return resp.StatusCode == 200, nil
}

// sendRequest mengirim HTTP request dan parse response
func (sc *ServiceClient) sendRequest(method, url string, body interface{}) (*ServiceResponse, error) {
	var reqBody io.Reader

	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Add authorization header jika ada API key
	apiKey := os.Getenv("GO_BACKEND_API_KEY")
	if apiKey != "" {
		req.Header.Set("X-API-Key", apiKey)
	}

	resp, err := sc.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var result ServiceResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	result.Code = resp.StatusCode

	return &result, nil
}

// LogIntegrationEvent mencatat event integrasi untuk debugging
func LogIntegrationEvent(eventType, source, target, status string, details map[string]interface{}) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	fmt.Printf("[%s] Integration Event: %s -> %s | Type: %s | Status: %s\n",
		timestamp, source, target, eventType, status)
	
	if len(details) > 0 {
		detailsJSON, _ := json.MarshalIndent(details, "  ", "  ")
		fmt.Printf("  Details: %s\n", string(detailsJSON))
	}
}

// PaymentIntegrationStatus mengirim status update ke semua services yang perlu tahu
func (sc *ServiceClient) PaymentIntegrationStatus(paymentID, userID, status string) error {
	details := map[string]interface{}{
		"paymentId": paymentID,
		"userId":    userID,
		"status":    status,
	}
	LogIntegrationEvent("PaymentStatusUpdate", "GoBackend", "StripeBackend", status, details)

	_, err := sc.SendPaymentUpdate(PaymentUpdateRequest{
		PaymentID: paymentID,
		UserID:    userID,
		Status:    status,
		Method:    "paypal",
	})

	return err
}
