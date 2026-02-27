
package handlers

import (
    "log"
    "time"
)

import (
    "net/http"
    "saas2/backend/database"
    "github.com/gin-gonic/gin"
)

// GetDashboardStats mendapatkan statistik dashboard lengkap
func GetDashboardStats(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    var totalUsers int64
    var totalPayments int64
    var totalRevenue float64
    var activeSubscriptions int64

    // Get total users
    database.DB.Model(&database.User{}).Count(&totalUsers)

    // Get total payments
    database.DB.Model(&database.Payment{}).
        Where("status = ?", "completed").
        Count(&totalPayments)

    // Get total revenue
    database.DB.Model(&database.Payment{}).
        Where("status = ?", "completed").
        Select("COALESCE(SUM(amount), 0)").
        Row().
        Scan(&totalRevenue)

    // Get active subscriptions
    database.DB.Model(&database.Subscription{}).
        Where("is_active = ?", true).
        Count(&activeSubscriptions)

    // Count subscriptions by plan
    var freeCount, standardCount, premiumCount int64
    database.DB.Model(&database.Subscription{}).
        Where("plan_type = ?", "free").
        Count(&freeCount)
    database.DB.Model(&database.Subscription{}).
        Where("plan_type = ?", "standard").
        Count(&standardCount)
    database.DB.Model(&database.Subscription{}).
        Where("plan_type = ?", "premium").
        Count(&premiumCount)

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": gin.H{
            "total_users":           totalUsers,
            "total_payments":        totalPayments,
            "total_revenue":         totalRevenue,
            "active_subscriptions":  activeSubscriptions,
            "subscriptions_by_plan": gin.H{
                "free":     freeCount,
                "standard": standardCount,
                "premium":  premiumCount,
            },
        },
    })
}

// GetPaymentsByStatus mendapatkan payments berdasarkan status
func GetPaymentsByStatus(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    status := c.DefaultQuery("status", "completed")

    var payments []database.Payment
    if err := database.DB.Where("status = ?", status).
        Order("created_at DESC").
        Find(&payments).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   true,
            "message": "Failed to fetch payments",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    payments,
    })
}

// GetSubscriptionsByPlan mendapatkan subscriptions berdasarkan plan type
func GetSubscriptionsByPlan(c *gin.Context) {
        log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
    planType := c.DefaultQuery("plan_type", "free")

    var subscriptions []database.Subscription
    if err := database.DB.Where("plan_type = ?", planType).
        Order("created_at DESC").
        Find(&subscriptions).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":   true,
            "message": "Failed to fetch subscriptions",
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data":    subscriptions,
    })
}