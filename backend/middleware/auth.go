package middleware


import (
	"net/http"
	"strings"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"log"
	"os"
)
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		log.Printf("[AUTH] Authorization header: %s", authHeader)
		if authHeader == "" {
			log.Println("[AUTH] No Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   true,
				"message": "Authorization header required",
			})
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		log.Printf("[AUTH] Token after trim: %s", token)
		if token == "" {
			log.Println("[AUTH] Token format invalid (empty after trim)")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   true,
				"message": "Invalid token format",
			})
			c.Abort()
			return
		}

		userID := extractUserIDFromToken(token)
		log.Printf("[AUTH] Extracted user_id: %s", userID)
		if userID == "" {
			log.Println("[AUTH] Token invalid, user_id not found")
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   true,
				"message": "Invalid token",
			})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}

func extractUserIDFromToken(tokenString string) string {
	// Try demo token first for backward compatibility
	if strings.HasPrefix(tokenString, "demo_jwt_token_") {
		return strings.TrimPrefix(tokenString, "demo_jwt_token_")
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return ""
	}
	type Claims struct {
		UserID string `json:"user_id"`
		Email  string `json:"email"`
		jwt.RegisteredClaims
	}
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})
	if err != nil || !token.Valid {
		return ""
	}
	return claims.UserID
}