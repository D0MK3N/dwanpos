package handlers

import (
    "fmt"
    "log"
    "math/rand"
    "net/http"
    "os"
    "time"

    "saas2/backend/database"
    "saas2/backend/utils"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
)

// Claims - JWT claims struct
type Claims struct {
    UserID string `json:"user_id"`
    Email  string `json:"email"`
    jwt.RegisteredClaims
}

// GenerateJWT - generate JWT token
func GenerateJWT(userID, email, name string) (string, error) {
    jwtSecret := os.Getenv("JWT_SECRET")
    if jwtSecret == "" {
        jwtSecret = "your-secret-key-change-in-production"
    }

    claims := &Claims{
        UserID: userID,
        Email:  email,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString([]byte(jwtSecret))
    if err != nil {
        return "", err
    }

    return tokenString, nil
}

// VerifyJWT - verify JWT token
func VerifyJWT(tokenString string) (*Claims, error) {
    jwtSecret := os.Getenv("JWT_SECRET")
    if jwtSecret == "" {
        jwtSecret = "your-secret-key-change-in-production"
    }

    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return []byte(jwtSecret), nil
    })

    if err != nil {
        return nil, err
    }

    if !token.Valid {
        return nil, fmt.Errorf("invalid token")
    }

    return claims, nil
}

// ChangePasswordRequest is used for password change
type ChangePasswordRequest struct {
    CurrentPassword string `json:"current_password" binding:"required"`
    NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// ChangePassword allows authenticated users to change their password
func ChangePassword(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error":   true,
            "message": "User not authenticated",
        })
        return
    }

    var req ChangePasswordRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error":   true,
            "message": "Invalid request: " + err.Error(),
        })
        return
    }

    var user database.User
    if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error":   true,
            "message": "User not found",
        })
        return
    }

    // Check current password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error":   true,
            "message": "Current password is incorrect",
        })
        return
    }

    // Hash new password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
    if err != nil {
        log.Printf("Password hashing error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   true,
            "message": "Failed to change password",
        })
        return
    }

    // Update password
    user.Password = string(hashedPassword)
    user.UpdatedAt = time.Now()
    if err := database.DB.Save(&user).Error; err != nil {
        log.Printf("Password update error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   true,
            "message": "Failed to update password",
        })
        return
    }

    log.Printf("Password changed for user %s", userID)
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Password changed successfully",
    })
}

type RegisterRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
    Name     string `json:"name" binding:"required"`
}

type LoginRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

// Register handler
func Register(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error":   true,
            "message": "Invalid request: " + err.Error(),
        })
        return
    }

    // Check if user already exists
    var existingUser database.User
    if err := database.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
        c.JSON(http.StatusConflict, gin.H{
            "error":   true,
            "message": "Email sudah terdaftar. Silakan gunakan email lain atau login jika sudah punya akun.",
            "suggestion": "Gunakan fitur lupa password jika tidak ingat kata sandi.",
        })
        return
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        log.Printf("Password hashing error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   true,
            "message": "Gagal mendaftar user.",
            "notification": "Terjadi masalah server. Silakan coba lagi nanti.",
        })
        return
    }

    // Create user
    user := database.User{
        ID:            utils.GenerateID(),
        Email:         req.Email,
        Password:      string(hashedPassword),
        Name:          req.Name,
        Plan:          "free",
        Subscription:  "free",
        IsActive:      true,
        EmailVerified: false,
        CreatedAt:     time.Now(),
        UpdatedAt:     time.Now(),
    }

    if err := database.DB.Create(&user).Error; err != nil {
        log.Printf("User creation error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   true,
            "message": "Gagal mendaftar user.",
            "notification": "Terjadi masalah server. Silakan coba lagi nanti.",
        })
        return
    }

    // Create free subscription
    currentPeriodStart := time.Now()
    currentPeriodEnd := time.Now().AddDate(100, 0, 0) // Free plan never expires
    subscription := database.Subscription{
        ID:                 utils.GenerateSubscriptionID(),
        UserID:             user.ID,
        PlanID:             "free",
        PlanType:           "free",
        Status:             "active",
        IsActive:           true,
        CurrentPeriodStart: &currentPeriodStart,
        CurrentPeriodEnd:   &currentPeriodEnd,
        CreatedAt:          time.Now(),
        UpdatedAt:          time.Now(),
    }

    if err := database.DB.Create(&subscription).Error; err != nil {
        log.Printf("Subscription creation error: %v", err)
    }

    // Generate verification token
    verificationCode := fmt.Sprintf("%06d", rand.Intn(1000000))
    log.Printf("Verification code for %s: %s", user.Email, verificationCode)

    log.Printf("User registered: %s (%s)", user.Email, user.ID)
    c.JSON(http.StatusCreated, gin.H{
        "success": true,
        "message": "Registration successful. Please verify your email.",
        "user": gin.H{
            "id":    user.ID,
            "email": user.Email,
            "name":  user.Name,
        },
    })
}

// Login handler
func Login(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error":   true,
            "message": "Data login tidak valid: " + err.Error(),
            "notification": "Mohon isi email dan password dengan benar.",
        })
        return
    }

    // Find user
    var user database.User
    if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error":   true,
            "message": "Email atau password salah.",
            "notification": "Email belum terdaftar atau password salah.",
        })
        return
    }

    // Check password
    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error":   true,
            "message": "Email atau password salah.",
            "notification": "Email belum terdaftar atau password salah.",
        })
        return
    }

    // Check if user is active
    if !user.IsActive {
        c.JSON(http.StatusForbidden, gin.H{
            "error":   true,
            "message": "Akun dinonaktifkan.",
            "notification": "Akun Anda tidak aktif. Hubungi admin jika butuh bantuan.",
        })
        return
    }

    // Generate JWT token
    token, err := GenerateJWT(user.ID, user.Email, user.Name)
    if err != nil {
        log.Printf("JWT generation error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   true,
            "message": "Gagal login.",
            "notification": "Terjadi masalah server. Silakan coba lagi nanti.",
        })
        return
    }

    // Set JWT as HttpOnly Secure cookie, SameSite=Strict, expires sesuai exp JWT
    c.SetSameSite(http.SameSiteStrictMode)
    c.SetCookie(
        "auth_token",
        token,
        60*60*24, // 1 day in seconds
        "/",
        "",
        true,  // Secure
        true,  // HttpOnly
    )

    // Get user subscription
    var subscription database.Subscription
    if err := database.DB.Where("user_id = ? AND is_active = ?", user.ID, true).First(&subscription).Error; err != nil {
        subscription = database.Subscription{
            ID:       utils.GenerateSubscriptionID(),
            UserID:   user.ID,
            PlanID:   "free",
            PlanType: "free",
            Status:   "active",
            IsActive: true,
        }
        database.DB.Create(&subscription)
    }

    log.Printf("User logged in: %s", user.Email)
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Login berhasil.",
        "notification": "Selamat datang, " + user.Name + "!",
        "user": gin.H{
            "id":           user.ID,
            "email":        user.Email,
            "name":         user.Name,
            "plan":         user.Plan,
            "subscription": subscription.PlanType,
        },
        "token": token,
    })
}

// Logout handler
func Logout(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    // Hapus cookie JWT (auth_token) dengan flag ketat
    c.SetSameSite(http.SameSiteStrictMode)
    c.SetCookie("auth_token", "", -1, "/", "", true, true)
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Logged out",
    })
}

// VerifyEmail handler
func VerifyEmail(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    token := c.Query("token")
    email := c.Query("email")

    if token == "" || email == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "error":   true,
            "message": "Missing verification token or email",
        })
        return
    }

    var user database.User
    if err := database.DB.Where("email = ?", email).First(&user).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error":   true,
            "message": "User not found",
        })
        return
    }

    // Update email verification status
    user.EmailVerified = true
    user.UpdatedAt = time.Now()
    if err := database.DB.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   true,
            "message": "Failed to verify email",
        })
        return
    }

    log.Printf("Email verified for user: %s", user.Email)
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": "Email verified successfully",
    })
}

// Profile handler
func Profile(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error":   true,
            "message": "User not authenticated",
        })
        return
    }

    var user database.User
    if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error":   true,
            "message": "User not found",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "user": gin.H{
            "id":             user.ID,
            "email":          user.Email,
            "name":           user.Name,
            "plan":           user.Plan,
            "subscription":   user.Subscription,
            "is_active":      user.IsActive,
            "email_verified": user.EmailVerified,
            "created_at":     user.CreatedAt,
        },
    })
}

// GetUserSubscription handler
func GetUserSubscription(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error":   true,
            "message": "User not authenticated",
        })
        return
    }

    log.Printf("🔍 GetUserSubscription: Looking for active subscription for user %v", userID)

    var subscription database.Subscription
    if err := database.DB.Where("user_id = ? AND is_active = ?", userID, true).First(&subscription).Error; err != nil {
        // Debug: Show all subscriptions for this user
        var allSubs []database.Subscription
        database.DB.Where("user_id = ?", userID).Find(&allSubs)
        log.Printf("⚠️  No active subscription found. All subscriptions for user %v: %d total", userID, len(allSubs))
        for _, sub := range allSubs {
            log.Printf("  - ID: %s, PlanType: %s, IsActive: %v, Status: %s", sub.ID, sub.PlanType, sub.IsActive, sub.Status)
        }
        
        // Return 200 with null data instead of 404 to avoid frontend errors
        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data":    nil,
            "message": "No active subscription found",
        })
        return
    }

    log.Printf("✅ Found active subscription: %s (plan: %s, is_active: %v)", subscription.ID, subscription.PlanType, subscription.IsActive)
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    subscription,
    })
}

// UpgradeSubscription handler
func UpgradeSubscription(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error":   true,
            "message": "User not authenticated",
        })
        return
    }

    var req struct {
        PlanType string `json:"plan_type" binding:"required,oneof=standard premium"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error":   true,
            "message": "Invalid request: " + err.Error(),
        })
        return
    }

    // Update user plan
    var user database.User
    if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error":   true,
            "message": "User not found",
        })
        return
    }

    user.Plan = req.PlanType
    user.Subscription = req.PlanType
    user.UpdatedAt = time.Now()
    database.DB.Save(&user)

    log.Printf("User %s upgraded to %s plan", userID, req.PlanType)
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "message": fmt.Sprintf("Subscription upgraded to %s", req.PlanType),
    })
}
