package middleware

import (
    "github.com/gin-gonic/gin"
    "strings"
    "saas2/backend/models"
    "saas2/backend/database"
    "log"
)

// Advanced API Key Middleware
func ApiKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		   apiKey := c.GetHeader("X-API-Key")
		   if apiKey == "" {
			   c.JSON(401, gin.H{"success": false, "message": "API key required"})
			   c.Abort()
			   return
		   }

		   // Tentukan jenis endpoint
		   path := c.FullPath()
		   var keyType string
		   if path != "" {
			   if strings.Contains(path, "/api/products") {
				   keyType = "product"
			   } else if strings.Contains(path, "/api/categories") {
				   keyType = "category"
			   } else if strings.Contains(path, "/api/transactions") || strings.Contains(path, "/api/transaction") {
				   keyType = "transaction"
			   }
		   }
		   if keyType == "" {
			   c.Next()
			   return
		   }

		   // Ambil user dengan API key sesuai jenis
		   var user models.User
		   var err error
		   switch keyType {
		   case "product":
			   err = database.DB.First(&user, "api_key_product = ?", apiKey).Error
		   case "category":
			   err = database.DB.First(&user, "api_key_category = ?", apiKey).Error
		   case "transaction":
			   err = database.DB.First(&user, "api_key_transaction = ?", apiKey).Error
		   }
		   if err != nil {
			   c.JSON(403, gin.H{"success": false, "message": "Invalid API key"})
			   c.Abort()
			   return
		   }

		   // Set user_id di context agar bisa dipakai endpoint
		   c.Set("user_id", user.ID)
		   c.Next()
	}
}

// Middleware untuk endpoint produk, kategori, transaksi
// Jika user sudah login (ada Authorization Bearer), validasi JWT dan user_id
// Jika tidak, validasi X-API-Key sesuai endpoint
func ApiKeyOrAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        apiKey := c.GetHeader("X-API-Key")
        var user models.User
        var err error
        path := c.FullPath()
        var keyType string
        if path != "" {
            if strings.Contains(path, "/api/products") {
                keyType = "product"
            } else if strings.Contains(path, "/api/categories") {
                keyType = "category"
            } else if strings.Contains(path, "/api/transactions") || strings.Contains(path, "/api/transaction") {
                keyType = "transaction"
            }
        }
        // Logging
        log.Printf("[AUTH] Path: %s, Authorization: %s, X-API-Key: %s", path, authHeader, apiKey)
        // Jika ada Authorization Bearer, validasi JWT
        if authHeader != "" {
            token := strings.TrimPrefix(authHeader, "Bearer ")
            userID := extractUserIDFromToken(token)
            if userID == "" {
                log.Println("[AUTH] JWT invalid: user_id not found, fallback to API key if available")
                // Fallback ke API key jika ada
                if apiKey != "" && keyType != "" {
                    switch keyType {
                    case "product":
                        err = database.DB.First(&user, "api_key_product = ?", apiKey).Error
                    case "category":
                        err = database.DB.First(&user, "api_key_category = ?", apiKey).Error
                    case "transaction":
                        err = database.DB.First(&user, "api_key_transaction = ?", apiKey).Error
                    }
                    if err != nil {
                        c.JSON(403, gin.H{"success": false, "message": "Invalid API key", "mode": "api_key"})
                        c.Abort()
                        return
                    }
                    c.Set("user_id", user.ID)
                    c.Set("auth_mode", "api_key")
                    c.Next()
                    return
                }
                c.JSON(401, gin.H{"success": false, "message": "Invalid token", "mode": "jwt"})
                c.Abort()
                return
            }
            err = database.DB.First(&user, "id = ?", userID).Error
            if err != nil {
                log.Println("[AUTH] JWT user not found")
                c.JSON(401, gin.H{"success": false, "message": "User not found", "mode": "jwt"})
                c.Abort()
                return
            }
            c.Set("user_id", user.ID)
            c.Set("auth_mode", "jwt")
            c.Next()
            return
        }
        // Jika tidak ada Authorization, validasi X-API-Key sesuai endpoint
        if apiKey == "" {
            log.Println("[AUTH] API key required")
            c.JSON(401, gin.H{"success": false, "message": "API key required", "mode": "api_key"})
            c.Abort()
            return
        }
        if keyType == "" {
            c.Next()
            return
        }
        switch keyType {
        case "product":
            err = database.DB.First(&user, "api_key_product = ?", apiKey).Error
        case "category":
            err = database.DB.First(&user, "api_key_category = ?", apiKey).Error
        case "transaction":
            err = database.DB.First(&user, "api_key_transaction = ?", apiKey).Error
        }
        if err != nil {
            log.Println("[AUTH] API key invalid")
            c.JSON(403, gin.H{"success": false, "message": "Invalid API key", "mode": "api_key"})
            c.Abort()
            return
        }
        c.Set("user_id", user.ID)
        c.Set("auth_mode", "api_key")
        c.Next()
    }
}
