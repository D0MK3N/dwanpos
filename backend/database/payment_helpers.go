package database

import (
    "encoding/json"
    "errors"
    "fmt"
    "log"
    "time"

    "gorm.io/gorm"
)

// ActivateUserSubscription (non-transactional wrapper)
func ActivateUserSubscription(userID, planID, paymentID string) error {
    db := DB
    payment := Payment{}
    if err := db.First(&payment, "id = ?", paymentID).Error; err != nil {
        return err
    }
    return activateUserSubscriptionTx(db.Begin(), userID, planID, payment.PaymentMethod, payment.BillingCycle)
}

// UpdatePaymentStatusByInvoice updates payment status by merchant_ref (invoice)
func UpdatePaymentStatusByInvoice(merchantRef, status string) error {
    db := DB
    payment := Payment{}
    if err := db.First(&payment, "merchant_ref = ?", merchantRef).Error; err != nil {
        return err
    }
    payment.Status = status
    if err := db.Save(&payment).Error; err != nil {
        return err
    }
    return nil
}

// CreatePaymentRecord - membuat payment record baru
func CreatePaymentRecord(payment *Payment) error {
    if payment.ID == "" {
        return errors.New("payment ID is required")
    }
    // Defensive: ensure Metadata is always valid JSON
    if payment.Metadata == "" {
        payment.Metadata = "{}"
    }
    return DB.Create(payment).Error
}

// GetPaymentByID - ambil payment berdasarkan ID
func GetPaymentByID(paymentID string) (*Payment, error) {
    var payment Payment
    err := DB.Where("id = ?", paymentID).First(&payment).Error
    if err != nil {
        return nil, err
    }
    return &payment, nil
}

// GetPaymentByPayPalOrderID - ambil payment berdasarkan PayPal Order ID
func GetPaymentByPayPalOrderID(orderID string) (*Payment, error) {
    var payment Payment
    err := DB.Where("paypal_order_id = ?", orderID).First(&payment).Error
    if err != nil {
        return nil, err
    }
    return &payment, nil
}

// GetPaymentByStripePaymentIntentID - ambil payment berdasarkan Stripe Payment Intent ID
func GetPaymentByStripePaymentIntentID(intentID string) (*Payment, error) {
    var payment Payment
    err := DB.Where("stripe_payment_intent_id = ?", intentID).First(&payment).Error
    if err != nil {
        return nil, err
    }
    return &payment, nil
}

// UpdatePaymentStatusWithHistory - update status payment dengan audit trail
func UpdatePaymentStatusWithHistory(paymentID, newStatus string, metadata map[string]interface{}) error {
    var payment Payment
    if err := DB.First(&payment, "id = ?", paymentID).Error; err != nil {
        return err
    }

    oldStatus := payment.Status
    payment.Status = newStatus

    // Update metadata if provided
    if metadata != nil {
        metadataJSON, err := json.Marshal(metadata)
        if err != nil {
            return err
        }
        payment.Metadata = string(metadataJSON)
    }
    // Defensive: ensure Metadata is always valid JSON
    if payment.Metadata == "" {
        payment.Metadata = "{}"
    }

    // Start transaction
    tx := DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Update payment
    if err := tx.Save(&payment).Error; err != nil {
        tx.Rollback()
        return err
    }

    // Create payment history
    historyMetadata, _ := json.Marshal(metadata)
    history := PaymentHistory{
        PaymentID: paymentID,
        UserID:    payment.UserID,
        Action:    "status_change",
        OldStatus: oldStatus,
        NewStatus: newStatus,
        Metadata:  string(historyMetadata),
    }
    if err := tx.Create(&history).Error; err != nil {
        tx.Rollback()
        return err
    }

    // Update user subscription if payment is completed
    if newStatus == "COMPLETED" || newStatus == "completed" {
        if err := activateUserSubscriptionTx(tx, payment.UserID, payment.PlanID, payment.PaymentMethod, payment.BillingCycle); err != nil {
            tx.Rollback()
            return err
        }
    }

    return tx.Commit().Error
}

// activateUserSubscriptionTx - aktivasi subscription user (dengan transaction)
func activateUserSubscriptionTx(tx *gorm.DB, userID, planID, paymentMethod, billingCycle string) error {
    // Deactivate existing subscriptions
    if err := tx.Model(&Subscription{}).
        Where("user_id = ? AND is_active = ?", userID, true).
        Updates(map[string]interface{}{
            "is_active":            false,
            "cancel_at_period_end": true,
            "canceled_at":          time.Now(),
        }).Error; err != nil {
        return err
    }

    // Calculate period end based on billing cycle
    now := time.Now()
    var periodEnd time.Time
    if billingCycle == "yearly" {
        periodEnd = now.AddDate(1, 0, 0)
    } else {
        periodEnd = now.AddDate(0, 1, 0)
    }

    // Create new subscription
    subscription := Subscription{
        ID:                 fmt.Sprintf("sub_%s_%d", userID, time.Now().Unix()),
        UserID:             userID,
        PlanID:             planID,
        PlanType:           planID,
        Status:             "active",
        BillingCycle:       billingCycle,
        CurrentPeriodStart: &now,
        CurrentPeriodEnd:   &periodEnd,
        IsActive:           true,
        PaymentMethod:      paymentMethod,
    }

    if err := tx.Create(&subscription).Error; err != nil {
        return err
    }

    // Update user plan
    if err := tx.Model(&User{}).
        Where("id = ?", userID).
        Updates(map[string]interface{}{
            "plan":         planID,
            "subscription": planID,
        }).Error; err != nil {
        return err
    }

    log.Printf("Activated %s subscription for user %s (%s)", planID, userID, billingCycle)
    return nil
}

// GetUserPayments - ambil semua payment user
func GetUserPayments(userID string, limit int) ([]Payment, error) {
    var payments []Payment
    query := DB.Where("user_id = ?", userID).Order("created_at DESC")
    if limit > 0 {
        query = query.Limit(limit)
    }
    err := query.Find(&payments).Error
    return payments, err
}

// GetUserSubscriptions - ambil subscriptions user
func GetUserSubscriptions(userID string) ([]Subscription, error) {
    var subscriptions []Subscription
    err := DB.Where("user_id = ?", userID).
        Order("created_at DESC").
        Find(&subscriptions).Error
    return subscriptions, err
}

// GetActiveSubscription - ambil subscription aktif user
func GetActiveSubscription(userID string) (*Subscription, error) {
    var subscription Subscription
    err := DB.Where("user_id = ? AND is_active = ? AND status = ?", userID, true, "active").
        First(&subscription).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, err
    }
    return &subscription, nil
}

// CancelSubscription - cancel subscription
func CancelSubscription(subscriptionID string, immediately bool) error {
    tx := DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    updates := map[string]interface{}{
        "cancel_at_period_end": true,
        "canceled_at":          time.Now(),
    }

    if immediately {
        updates["is_active"] = false
        updates["status"] = "canceled"
    }

    if err := tx.Model(&Subscription{}).
        Where("id = ?", subscriptionID).
        Updates(updates).Error; err != nil {
        tx.Rollback()
        return err
    }

    return tx.Commit().Error
}

// SaveWebhookEvent - simpan webhook event
func SaveWebhookEvent(provider, eventID, eventType string, payload interface{}) error {
    payloadJSON, err := json.Marshal(payload)
    if err != nil {
        return err
    }

    event := WebhookEvent{
        EventID:   eventID,
        Provider:  provider,
        EventType: eventType,
        Payload:   string(payloadJSON),
        Processed: false,
    }

    return DB.Create(&event).Error
}

// MarkWebhookAsProcessed - tandai webhook sebagai processed
func MarkWebhookAsProcessed(eventID string, errorMsg string) error {
    now := time.Now()
    updates := map[string]interface{}{
        "processed":    true,
        "processed_at": &now,
    }

    if errorMsg != "" {
        updates["error_message"] = errorMsg
    }

    return DB.Model(&WebhookEvent{}).
        Where("event_id = ?", eventID).
        Updates(updates).Error
}

// RecordConsent - simpan user consent
func RecordConsent(userID, consentType, ipAddress, userAgent string, agreed bool) error {
    now := time.Now()
    consent := UserConsent{
        UserID:      userID,
        ConsentType: consentType,
        Agreed:      agreed,
        AgreedAt:    &now,
        IPAddress:   ipAddress,
        UserAgent:   userAgent,
    }
    return DB.Create(&consent).Error
}

// TrackUsage - track user usage
func TrackUsage(userID, planID, actionType string, count int) error {
    now := time.Now()
    periodStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
    periodEnd := periodStart.AddDate(0, 1, 0).Add(-time.Second)

    usage := UsageTracking{
        UserID:          userID,
        PlanID:          planID,
        ActionType:      actionType,
        GenerationCount: count,
        PeriodStart:     periodStart,
        PeriodEnd:       periodEnd,
    }

    return DB.Create(&usage).Error
}

// GetUserUsageThisMonth - ambil usage user bulan ini
func GetUserUsageThisMonth(userID string) (int, error) {
    now := time.Now()
    periodStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
    periodEnd := periodStart.AddDate(0, 1, 0).Add(-time.Second)

    var total int64
    err := DB.Model(&UsageTracking{}).
        Where("user_id = ? AND period_start >= ? AND period_end <= ?", userID, periodStart, periodEnd).
        Select("COALESCE(SUM(generation_count), 0)").
        Scan(&total).Error

    return int(total), err
}

// GetPlanByID - ambil plan berdasarkan ID
func GetPlanByID(planID string) (*Plan, error) {
    var plan Plan
    err := DB.Where("id = ? AND is_active = ?", planID, true).First(&plan).Error
    if err != nil {
        return nil, err
    }
    return &plan, nil
}

// GetAllActivePlans - ambil semua plan aktif
func GetAllActivePlans() ([]Plan, error) {
    var plans []Plan
    err := DB.Where("is_active = ?", true).Order("price ASC").Find(&plans).Error
    return plans, err
}

// GetPaymentHistory - ambil payment history
func GetPaymentHistory(paymentID string) ([]PaymentHistory, error) {
    var history []PaymentHistory
    err := DB.Where("payment_id = ?", paymentID).
        Order("created_at DESC").
        Find(&history).Error
    return history, err
}

// GetUnprocessedWebhooks - ambil webhook yang belum diproses
func GetUnprocessedWebhooks(provider string, limit int) ([]WebhookEvent, error) {
    var webhooks []WebhookEvent
    query := DB.Where("provider = ? AND processed = ?", provider, false).
        Order("created_at ASC")
    if limit > 0 {
        query = query.Limit(limit)
    }
    err := query.Find(&webhooks).Error
    return webhooks, err
}

// CheckUserConsent - cek apakah user sudah memberikan consent
func CheckUserConsent(userID, consentType string) (bool, error) {
    var consent UserConsent
    err := DB.Where("user_id = ? AND consent_type = ? AND agreed = ?", userID, consentType, true).
        Order("created_at DESC").
        First(&consent).Error

    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return false, nil
        }
        return false, err
    }

    return true, nil
}

// GetUserConsents - ambil semua consent user
func GetUserConsents(userID string) ([]UserConsent, error) {
    var consents []UserConsent
    err := DB.Where("user_id = ?", userID).
        Order("created_at DESC").
        Find(&consents).Error
    return consents, err
}

// GetUser - ambil user berdasarkan ID
func GetUser(userID string) (*User, error) {
    var user User
    err := DB.Where("id = ?", userID).First(&user).Error
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// GetUserByEmail - ambil user berdasarkan email
func GetUserByEmail(email string) (*User, error) {
    var user User
    err := DB.Where("email = ?", email).First(&user).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, nil
        }
        return nil, err
    }
    return &user, nil
}

// UpdateUser - update data user
func UpdateUser(userID string, updates map[string]interface{}) error {
    return DB.Model(&User{}).
        Where("id = ?", userID).
        Updates(updates).Error
}

// GetUserStats - ambil statistik user
func GetUserStats(userID string) (map[string]interface{}, error) {
    var totalPayments int64
    var totalRevenue float64
    var usageThisMonth int

    // Total payments
    DB.Model(&Payment{}).
        Where("user_id = ? AND status = ?", userID, "completed").
        Count(&totalPayments)

    // Total revenue
    DB.Model(&Payment{}).
        Where("user_id = ? AND status = ?", userID, "completed").
        Select("COALESCE(SUM(amount), 0)").
        Row().
        Scan(&totalRevenue)

    // Usage this month
    usageThisMonth, _ = GetUserUsageThisMonth(userID)

    return map[string]interface{}{
        "total_payments":   totalPayments,
        "total_revenue":    totalRevenue,
        "usage_this_month": usageThisMonth,
    }, nil
}