
package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"saas2/backend/database"
	"saas2/backend/models"
)

type Category struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func GetCategories(c *gin.Context) {
	log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())

	var categories []models.Category
	if err := database.DB.Order("created_at DESC").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal mengambil data kategori", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data kategori berhasil diambil", "data": categories})
}

func CreateCategory(c *gin.Context) {
	log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	var cat Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid data", "data": nil})
		return
	}

	newCategory := models.Category{
		ID:   "C" + fmt.Sprintf("%d", time.Now().UnixNano()),
		Name: cat.Name,
	}

	if err := database.DB.Create(&newCategory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menyimpan kategori", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kategori berhasil ditambahkan", "data": newCategory})
}

func UpdateCategory(c *gin.Context) {
	log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	id := c.Param("id")
	var cat Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid data", "data": nil})
		return
	}

	var existing models.Category
	if err := database.DB.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Kategori tidak ditemukan", "data": nil})
		return
	}

	existing.Name = cat.Name
	oldName := existing.Name

	tx := database.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal memulai transaksi update kategori", "data": nil})
		return
	}

	if err := tx.Save(&existing).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal update kategori", "data": nil})
		return
	}

	if err := tx.Model(&database.Product{}).
		Where("category_name = ?", oldName).
		Update("category_name", existing.Name).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal sinkronisasi kategori pada produk", "data": nil})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menyimpan perubahan kategori", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kategori berhasil diupdate", "data": existing})
}

func DeleteCategory(c *gin.Context) {
	log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	id := c.Param("id")

	var existing models.Category
	if err := database.DB.First(&existing, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Kategori tidak ditemukan", "data": nil})
		return
	}

	var productsCount int64
	if err := database.DB.Model(&database.Product{}).
		Where("category_name = ?", existing.Name).
		Count(&productsCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal validasi relasi kategori", "data": nil})
		return
	}

	if productsCount > 0 {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"message": "Kategori tidak bisa dihapus karena masih digunakan oleh produk",
			"data": gin.H{
				"products_count": productsCount,
			},
		})
		return
	}

	if err := database.DB.Delete(&existing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal hapus kategori", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kategori berhasil dihapus", "data": true})
}
