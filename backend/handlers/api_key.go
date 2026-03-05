package handlers

import (
	"net/http"
	"saas2/backend/database"
	"saas2/backend/models"
	"saas2/backend/utils"
	"github.com/gin-gonic/gin"
)

// GET /api/profile/api-keys
func GetApiKeys(c *gin.Context) {
	userID := c.GetString("user_id")
	var user models.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"api_key_product": user.ApiKeyProduct,
		"api_key_category": user.ApiKeyCategory,
		"api_key_transaction": user.ApiKeyTransaction,
		"note": "API key digunakan untuk autentikasi endpoint produk, kategori, dan transaksi. Jangan bagikan ke pihak lain. Jika bocor, generate ulang!",
	})
}

// POST /api/profile/api-keys/generate
func GenerateApiKeys(c *gin.Context) {
	userID := c.GetString("user_id")
	var user models.User
	if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "User not found"})
		return
	}
	user.ApiKeyProduct = utils.GenerateApiKey()
	user.ApiKeyCategory = utils.GenerateApiKey()
	user.ApiKeyTransaction = utils.GenerateApiKey()
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to save API keys"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"api_key_product": user.ApiKeyProduct,
		"api_key_category": user.ApiKeyCategory,
		"api_key_transaction": user.ApiKeyTransaction,
		"note": "API key berhasil digenerate. Simpan baik-baik dan gunakan sesuai endpoint.",
	})
}
