
package handlers

import (
	"log"
	"time"
)

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"fmt"
)

type Category struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

var categories = []Category{
	{ID: "C001", Name: "Minuman"},
	{ID: "C002", Name: "Makanan"},
}

func GetCategories(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Data kategori berhasil diambil", "data": categories})
}

func CreateCategory(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	var cat Category
	   if err := c.ShouldBindJSON(&cat); err != nil {
		   c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid data", "data": nil})
		   return
	   }
	cat.ID = "C" + fmt.Sprintf("%03d", len(categories)+1)
	categories = append(categories, cat)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kategori berhasil ditambahkan", "data": cat})
}

func UpdateCategory(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	id := c.Param("id")
	var cat Category
	   if err := c.ShouldBindJSON(&cat); err != nil {
		   c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid data", "data": nil})
		   return
	   }
	   for i, ccat := range categories {
		   if ccat.ID == id {
			   categories[i].Name = cat.Name
			   c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kategori berhasil diupdate", "data": categories[i]})
			   return
		   }
	   }
	   c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Kategori tidak ditemukan", "data": nil})
}

func DeleteCategory(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	id := c.Param("id")
	   for i, ccat := range categories {
		   if ccat.ID == id {
			   categories = append(categories[:i], categories[i+1:]...)
			   c.JSON(http.StatusOK, gin.H{"success": true, "message": "Kategori berhasil dihapus", "data": true})
			   return
		   }
	   }
	   c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Kategori tidak ditemukan", "data": nil})
}
