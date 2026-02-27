
package handlers

import (
	"log"
	"time"
)

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type Plan struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Currency    string  `json:"currency"`
	Description string  `json:"description"`
}

// Example: Fetch plans from DB (or static for now)
func GetPlans(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	plans := []Plan{
		{ID: "free", Name: "Free", Price: 0, Currency: "IDR", Description: "Start your journey"},
		{ID: "standard", Name: "Standard", Price: 50000, Currency: "IDR", Description: "For growing teams"},
		{ID: "premium", Name: "Premium", Price: 120000, Currency: "IDR", Description: "For power users"},
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": plans,
	})
}
