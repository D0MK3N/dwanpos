
package handlers

import (
	"log"
	"time"
)

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "saas2/backend/utils"
)

// Me handler: return user info from JWT in cookie or Authorization header
func Me(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	var token string

	// Cek cookie auth_token
	cookie, err := c.Request.Cookie("auth_token")
	if err == nil && cookie.Value != "" {
		token = cookie.Value
	}

	// Jika tidak ada di cookie, cek header Authorization
	if token == "" {
		authHeader := c.GetHeader("Authorization")
		if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			token = authHeader[7:]
		}
	}

	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": true, "message": "No token"})
		return
	}

	claims, err := utils.VerifyJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": true, "message": "Invalid token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id": claims.UserID,
			"email": claims.Email,
			"name": claims.Name,
		},
	})
}
