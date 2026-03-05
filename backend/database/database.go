package database

import (
    "fmt"
    "log"
    "os"
    "strings"
    "time"

    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"

    "saas2/backend/models"
)

var DB *gorm.DB

// User model
type User struct {
    ID            string    `gorm:"primaryKey;type:varchar(255)" json:"id"`
    Email         string    `gorm:"uniqueIndex;not null;type:varchar(255)" json:"email"`
    Password      string    `gorm:"not null;type:varchar(255)" json:"-"`
    Name          string    `gorm:"not null;type:varchar(255)" json:"name"`
    Plan          string    `gorm:"default:'free';type:varchar(50)" json:"plan"`
    Subscription  string    `gorm:"default:'free';type:varchar(50)" json:"subscription"`
    IsActive      bool      `gorm:"default:true" json:"is_active"`
    EmailVerified bool      `gorm:"default:false" json:"email_verified"`
    ApiKeyProduct    string `gorm:"type:varchar(255)" json:"api_key_product"`
    ApiKeyCategory   string `gorm:"type:varchar(255)" json:"api_key_category"`
    ApiKeyTransaction string `gorm:"type:varchar(255)" json:"api_key_transaction"`
    CreatedAt     time.Time `json:"created_at"`
    UpdatedAt     time.Time `json:"updated_at"`
    DeletedAt     *time.Time `gorm:"index" json:"deleted_at"`
}

// Plan model
type Plan struct {
    ID              string    `gorm:"primaryKey;type:varchar(50)" json:"id"`
    Name            string    `gorm:"not null;type:varchar(100)" json:"name"`
    Price           float64   `gorm:"not null;type:decimal(10,2);default:0.00" json:"price"`
    Currency        string    `gorm:"default:'USD';type:varchar(3)" json:"currency"`
    Description     string    `gorm:"type:text" json:"description"`
    Features        string    `gorm:"type:json" json:"features"`
    IsActive        bool      `gorm:"default:true" json:"is_active"`
    MaxGenerations  int       `json:"max_generations"`
    AIModels        string    `gorm:"type:text" json:"ai_models"`
    ProcessingSpeed string    `gorm:"type:varchar(50)" json:"processing_speed"`
    OutputQuality   string    `gorm:"type:varchar(50)" json:"output_quality"`
    SupportLevel    string    `gorm:"type:varchar(50)" json:"support_level"`
    CreatedAt       time.Time `json:"created_at"`
    UpdatedAt       time.Time `json:"updated_at"`
}

// Payment model - UPDATED untuk support PayPal & Stripe
type Payment struct {
    ID                      string    `gorm:"primaryKey;type:varchar(255)" json:"id"`
    UserID                  string    `gorm:"not null;index;type:varchar(255)" json:"user_id"`
    PlanID                  string    `gorm:"not null;type:varchar(50)" json:"plan_id"`
    Amount                  float64   `gorm:"not null;type:decimal(10,2)" json:"amount"`
    Currency                string    `gorm:"default:'USD';type:varchar(3)" json:"currency"`
    Status                  string    `gorm:"not null;default:'pending';type:varchar(50)" json:"status"`
    PaymentMethod           string    `gorm:"type:varchar(50)" json:"payment_method"`
    PayPalOrderID           string    `gorm:"type:varchar(255);index" json:"paypal_order_id,omitempty"`
    StripePaymentIntentID   string    `gorm:"type:varchar(255);index" json:"stripe_payment_intent_id,omitempty"`
    BillingCycle            string    `gorm:"default:'monthly';type:varchar(20)" json:"billing_cycle"`
    Metadata                string    `gorm:"type:json" json:"metadata,omitempty"`
    CreatedAt               time.Time `json:"created_at"`
    UpdatedAt               time.Time `json:"updated_at"`
}

// Subscription model - UPDATED
type Subscription struct {
    ID                    string     `gorm:"primaryKey;type:varchar(255)" json:"id"`
    UserID                string     `gorm:"not null;index;type:varchar(255)" json:"user_id"`
    PlanID                string     `gorm:"not null;index;type:varchar(50)" json:"plan_id"`
    PlanType              string     `gorm:"not null;type:varchar(50)" json:"plan_type"`
    Status                string     `gorm:"default:'active';type:varchar(50)" json:"status"`
    BillingCycle          string     `gorm:"default:'monthly';type:varchar(20)" json:"billing_cycle"`
    CurrentPeriodStart    *time.Time `json:"current_period_start"`
    CurrentPeriodEnd      *time.Time `json:"current_period_end"`
    CancelAtPeriodEnd     bool       `gorm:"default:false" json:"cancel_at_period_end"`
    CanceledAt            *time.Time `json:"canceled_at"`
    IsActive              bool       `gorm:"default:true" json:"is_active"`
    PaymentMethod         string     `gorm:"type:varchar(50)" json:"payment_method"`
    StripeSubscriptionID  string     `gorm:"type:varchar(255)" json:"stripe_subscription_id,omitempty"`
    PayPalSubscriptionID  string     `gorm:"type:varchar(255)" json:"paypal_subscription_id,omitempty"`
    CreatedAt             time.Time  `json:"created_at"`
    UpdatedAt             time.Time  `json:"updated_at"`
}

// PaymentHistory model - untuk audit trail
type PaymentHistory struct {
    ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
    PaymentID string    `gorm:"type:varchar(255);index" json:"payment_id"`
    UserID    string    `gorm:"type:varchar(255);index" json:"user_id"`
    Action    string    `gorm:"not null;type:varchar(100)" json:"action"`
    OldStatus string    `gorm:"type:varchar(50)" json:"old_status"`
    NewStatus string    `gorm:"type:varchar(50)" json:"new_status"`
    Metadata  string    `gorm:"type:json" json:"metadata,omitempty"`
    CreatedAt time.Time `json:"created_at"`
}

// WebhookEvent model - untuk tracking webhook dari PayPal & Stripe
type WebhookEvent struct {
    ID           uint       `gorm:"primaryKey;autoIncrement" json:"id"`
    EventID      string     `gorm:"uniqueIndex;not null;type:varchar(255)" json:"event_id"`
    Provider     string     `gorm:"not null;index;type:varchar(50)" json:"provider"`
    EventType    string     `gorm:"not null;type:varchar(100)" json:"event_type"`
    Payload      string     `gorm:"not null;type:json" json:"payload"`
    Processed    bool       `gorm:"default:false;index" json:"processed"`
    ProcessedAt  *time.Time `json:"processed_at"`
    ErrorMessage string     `gorm:"type:text" json:"error_message,omitempty"`
    CreatedAt    time.Time  `json:"created_at"`
}

// UserConsent model - untuk GDPR compliance
type UserConsent struct {
    ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
    UserID      string    `gorm:"not null;index;type:varchar(255)" json:"user_id"`
    ConsentType string    `gorm:"not null;index;type:varchar(50)" json:"consent_type"`
    Agreed      bool      `gorm:"default:false" json:"agreed"`
    AgreedAt    *time.Time `json:"agreed_at"`
    IPAddress   string    `gorm:"type:varchar(45)" json:"ip_address,omitempty"`
    UserAgent   string    `gorm:"type:text" json:"user_agent,omitempty"`
    CreatedAt   time.Time `json:"created_at"`
}

// UsageTracking model - untuk tracking penggunaan user
type UsageTracking struct {
    ID              uint      `gorm:"primaryKey;autoIncrement" json:"id"`
    UserID          string    `gorm:"not null;index;type:varchar(255)" json:"user_id"`
    PlanID          string    `gorm:"type:varchar(50);index" json:"plan_id"`
    ActionType      string    `gorm:"not null;type:varchar(50)" json:"action_type"`
    GenerationCount int       `gorm:"default:1" json:"generation_count"`
    PeriodStart     time.Time `gorm:"index" json:"period_start"`
    PeriodEnd       time.Time `gorm:"index" json:"period_end"`
    CreatedAt       time.Time `json:"created_at"`
}

// Product model untuk GORM
// Pastikan field dan tag sesuai kebutuhan

type Product struct {
    ID         string  `gorm:"primaryKey;type:varchar(255)" json:"id"`
    Name       string  `gorm:"not null;type:varchar(255)" json:"name"`
    CategoryName string  `gorm:"not null;type:varchar(255)" json:"category_name"`
    Price      float64 `gorm:"not null;type:decimal(10,2)" json:"price"`
    Stock      int     `gorm:"not null" json:"stock"`
    ImageURL   string  `gorm:"type:text" json:"image_url"`
    CreatedAt  time.Time `json:"created_at"`
    UpdatedAt  time.Time `json:"updated_at"`
}

func InitDB() error {
    // MySQL connection string
    dsn := getMySQLDSN()

    newLogger := logger.New(
        log.New(os.Stdout, "\r\n", log.LstdFlags),
        logger.Config{
            SlowThreshold: time.Second,
            LogLevel:      logger.Info,
            Colorful:      true,
        },
    )

    var err error
    DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
        Logger: newLogger,
    })
    if err != nil {
        return fmt.Errorf("failed to connect to MySQL database: %w", err)
    }

    // Get underlying SQL DB to configure connection pool
    sqlDB, err := DB.DB()
    if err != nil {
        return fmt.Errorf("failed to get SQL DB: %w", err)
    }

    // Configure connection pool
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)

    log.Println("✅ MySQL database connected successfully")
    
    // Auto migrate tables
    return MigrateDB()
}

func getMySQLDSN() string {
    dbHost := getEnv("DB_HOST", "localhost")
    dbPort := getEnv("DB_PORT", "3306")
    dbUser := getEnv("DB_USER", "root")
    dbPass := getEnv("DB_PASSWORD", "")
    dbName := getEnv("DB_NAME", "auth_db")

    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
        dbUser, dbPass, dbHost, dbPort, dbName)

    log.Printf("🔗 MySQL DSN: %s@tcp(%s:%s)/%s", dbUser, dbHost, dbPort, dbName)
    return dsn
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}

func MigrateDB() error {
    err := DB.AutoMigrate(
        &User{},
        &Plan{},
        &Payment{},
        &Subscription{},
        &PaymentHistory{},
        &WebhookEvent{},
        &UserConsent{},
        &UsageTracking{},
        &Product{},
        &models.Category{},
        &models.Transaction{},
        &models.TransactionItem{},
    )
    if err != nil {
        return fmt.Errorf("failed to migrate database: %w", err)
    }

    log.Println("✅ Database tables migrated successfully")
    
    // Seed default plans
    seedDefaultPlans()

	if err := seedDefaultCategories(); err != nil {
		return fmt.Errorf("failed to seed default categories: %w", err)
	}

    if err := syncProductCategoryNames(); err != nil {
        return fmt.Errorf("failed to sync product category names: %w", err)
    }
    
    return nil
}

func seedDefaultCategories() error {
    defaultCategories := []string{"Makanan", "Minuman", "Snack"}

    for _, categoryName := range defaultCategories {
        normalized := strings.ToLower(strings.TrimSpace(categoryName))

        var existingCategory models.Category
        err := DB.Where("LOWER(name) = ?", normalized).First(&existingCategory).Error
        if err == nil {
            if existingCategory.Name != categoryName {
                existingCategory.Name = categoryName
                if saveErr := DB.Save(&existingCategory).Error; saveErr != nil {
                    return saveErr
                }
                log.Printf("✅ Normalized category name: %s", categoryName)
            }
            continue
        }

        if err != gorm.ErrRecordNotFound {
            return err
        }

        newCategory := models.Category{
            ID:   "C" + fmt.Sprintf("%d", time.Now().UnixNano()),
            Name: categoryName,
        }

        if createErr := DB.Create(&newCategory).Error; createErr != nil {
            return createErr
        }

        log.Printf("✅ Created default category: %s", categoryName)
    }

    return nil
}

func syncProductCategoryNames() error {
    var categories []models.Category
    if err := DB.Find(&categories).Error; err != nil {
        return err
    }

    if len(categories) == 0 {
        log.Println("ℹ️  Skip product category sync: no categories found")
        return nil
    }

    categoryMap := make(map[string]string)
    for _, category := range categories {
        normalized := strings.ToLower(strings.TrimSpace(category.Name))
        if normalized != "" {
            categoryMap[normalized] = category.Name
        }
    }

    var products []Product
    if err := DB.Find(&products).Error; err != nil {
        return err
    }

    if len(products) == 0 {
        log.Println("ℹ️  Skip product category sync: no products found")
        return nil
    }

    tx := DB.Begin()
    if tx.Error != nil {
        return tx.Error
    }

    updatedCount := 0
    unmatchedCount := 0

    for _, product := range products {
        normalized := strings.ToLower(strings.TrimSpace(product.CategoryName))
        canonicalName, exists := categoryMap[normalized]
        if !exists {
            unmatchedCount++
            continue
        }

        if product.CategoryName == canonicalName {
            continue
        }

        if err := tx.Model(&Product{}).
            Where("id = ?", product.ID).
            Update("category_name", canonicalName).Error; err != nil {
            tx.Rollback()
            return err
        }

        updatedCount++
    }

    if err := tx.Commit().Error; err != nil {
        return err
    }

    log.Printf("✅ Product category sync completed: updated=%d unmatched=%d", updatedCount, unmatchedCount)
    return nil
}

func seedDefaultPlans() {
    plans := []Plan{
        {
            ID:              "free",
            Name:            "Free",
            Price:           0.00,
            Currency:        "USD",
            Description:     "Perfect for getting started",
            Features:        `["5 Generations per day","Basic AI Models","720p Quality","Community Support"]`,
            MaxGenerations:  5,
            AIModels:        "Basic AI Models",
            ProcessingSpeed: "Standard",
            OutputQuality:   "720p",
            SupportLevel:    "Community Support",
        },
        {
            ID:              "standard",
            Name:            "Standard",
            Price:           9.99,
            Currency:        "USD",
            Description:     "Perfect for regular creators",
            Features:        `["100 Generations per month","Advanced AI Models","1080p Quality","Priority Support","Commercial Use"]`,
            MaxGenerations:  100,
            AIModels:        "Advanced AI Models",
            ProcessingSpeed: "2x Faster",
            OutputQuality:   "1080p",
            SupportLevel:    "Priority Support",
        },
        {
            ID:              "premium",
            Name:            "Premium",
            Price:           29.99,
            Currency:        "USD",
            Description:     "For professionals & agencies",
            Features:        `["Unlimited Generations","All Premium AI Models","4K Quality","VIP Support 24/7","API Access","Priority Processing"]`,
            MaxGenerations:  -1, // unlimited
            AIModels:        "All Premium AI Models",
            ProcessingSpeed: "4x Faster",
            OutputQuality:   "4K",
            SupportLevel:    "VIP Support 24/7",
        },
    }

    for _, plan := range plans {
        var existingPlan Plan
        result := DB.Where("id = ?", plan.ID).First(&existingPlan)
        if result.Error != nil {
            // Plan doesn't exist, create it
            plan.IsActive = true
            plan.CreatedAt = time.Now()
            plan.UpdatedAt = time.Now()
            DB.Create(&plan)
            log.Printf("✅ Created plan: %s", plan.Name)
        } else {
            log.Printf("ℹ️  Plan already exists: %s", plan.Name)
        }
    }
}

func CloseDB() error {
    if DB != nil {
        sqlDB, err := DB.DB()
        if err != nil {
            return err
        }
        return sqlDB.Close()
    }
    return nil
}

// Helper functions untuk payment

// CreatePayment - membuat payment baru
func CreatePayment(payment *Payment) error {
    // Defensive: ensure Metadata is always valid JSON
    if payment.Metadata == "" {
        payment.Metadata = "{}"
    }
    return DB.Create(payment).Error
}

// UpdatePaymentStatus - update status payment dan buat audit trail
func UpdatePaymentStatus(paymentID, newStatus string) error {
    var payment Payment
    if err := DB.First(&payment, "id = ?", paymentID).Error; err != nil {
        return err
    }

    oldStatus := payment.Status
    payment.Status = newStatus
    // Defensive: ensure Metadata is always valid JSON
    if payment.Metadata == "" {
        payment.Metadata = "{}"
    }

    // Start transaction
    tx := DB.Begin()

    // Update payment
    if err := tx.Save(&payment).Error; err != nil {
        tx.Rollback()
        return err
    }

    // Create payment history
    history := PaymentHistory{
        PaymentID: paymentID,
        UserID:    payment.UserID,
        Action:    "status_change",
        OldStatus: oldStatus,
        NewStatus: newStatus,
    }
    if err := tx.Create(&history).Error; err != nil {
        tx.Rollback()
        return err
    }

    return tx.Commit().Error
}

// GetUserActiveSubscription - ambil subscription aktif user
func GetUserActiveSubscription(userID string) (*Subscription, error) {
    var subscription Subscription
    err := DB.Where("user_id = ? AND is_active = ? AND status = ?", userID, true, "active").
        First(&subscription).Error
    return &subscription, err
}

// CreateWebhookEvent - simpan webhook event
func CreateWebhookEvent(event *WebhookEvent) error {
    return DB.Create(event).Error
}

// RecordUserConsent - simpan consent user
func RecordUserConsent(consent *UserConsent) error {
    now := time.Now()
    consent.AgreedAt = &now
    return DB.Create(consent).Error
}