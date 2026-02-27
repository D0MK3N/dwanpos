
package handlers

import "log"

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"fmt"
	"saas2/backend/database"
	"time"
	"path/filepath"
	"strings"
	"os"
)

type Product struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	CategoryName string  `json:"category_name"`
	Price      float64 `json:"price"`
	Stock      int     `json:"stock"`
	ImageURL   string  `json:"image_url"`
}

type ProductWithCategory struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	CategoryName string  `json:"category_name"`
	Category   string  `json:"category"`
	Price      float64 `json:"price"`
	Stock      int     `json:"stock"`
	ImageURL   string  `json:"image_url"`
}

// Tambah produk
func CreateProduct(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	var p database.Product
	   if err := c.ShouldBindJSON(&p); err != nil {
		   c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid data", "data": nil})
		   return
	   }
	p.ID = "P" + fmt.Sprintf("%d", time.Now().UnixNano())
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	if p.ImageURL == "" {
		p.ImageURL = "https://via.placeholder.com/100x100?text=Produk"
	}
	   if err := database.DB.Create(&p).Error; err != nil {
		   c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menyimpan produk", "data": nil})
		   return
	   }
	   c.JSON(http.StatusOK, gin.H{"success": true, "message": "Produk berhasil ditambahkan", "data": p})
}

// Update produk
func UpdateProduct(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	id := c.Param("id")
	var p database.Product
	   if err := c.ShouldBindJSON(&p); err != nil {
		   c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid data", "data": nil})
		   return
	   }
	var existing database.Product
	   if err := database.DB.First(&existing, "id = ?", id).Error; err != nil {
		   c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Produk tidak ditemukan", "data": nil})
		   return
	   }
	p.ID = id
	p.CreatedAt = existing.CreatedAt
	p.UpdatedAt = time.Now()
	if p.ImageURL == "" {
		p.ImageURL = "https://via.placeholder.com/100x100?text=Produk"
	}
	   if err := database.DB.Save(&p).Error; err != nil {
		   c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal update produk", "data": nil})
		   return
	   }
	   c.JSON(http.StatusOK, gin.H{"success": true, "message": "Produk berhasil diupdate", "data": p})
}

// Hapus produk
func DeleteProduct(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	id := c.Param("id")
	   if err := database.DB.Delete(&database.Product{}, "id = ?", id).Error; err != nil {
		   c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal hapus produk", "data": nil})
		   return
	   }
	   c.JSON(http.StatusOK, gin.H{"success": true, "message": "Produk berhasil dihapus", "data": true})
}

// List produk
func GetProducts(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	var products []database.Product
	   if err := database.DB.Find(&products).Error; err != nil {
		   c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal mengambil data produk", "data": nil})
		   return
	   }
	   c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data produk berhasil diambil", "data": products})
}

// Upload gambar produk
func UploadProductImage(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	file, err := c.FormFile("image")
	   if err != nil {
		   c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "No file uploaded", "data": nil})
		   return
	   }
	   if file.Size > 1*1024*1024 {
		   c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "File terlalu besar (max 1MB)", "data": nil})
		   return
	   }
	ext := strings.ToLower(filepath.Ext(file.Filename))
	   if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		   c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Format gambar tidak didukung", "data": nil})
		   return
	   }
	// Pastikan folder uploads ada
	uploadDir := filepath.Join("public", "uploads")
	   if err := os.MkdirAll(uploadDir, 0755); err != nil {
		   c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal membuat folder upload", "data": nil})
		   return
	   }
	filename := "product_" + fmt.Sprintf("%d", time.Now().UnixNano()) + ext
	path := filepath.Join(uploadDir, filename)
	   if err := c.SaveUploadedFile(file, path); err != nil {
		   c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal upload file", "data": nil})
		   return
	   }
	imageURL := "/uploads/" + filename
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Upload gambar berhasil", "data": map[string]string{"url": imageURL}})
}
