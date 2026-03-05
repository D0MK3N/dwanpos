package routes

import (
	"github.com/gin-gonic/gin"
	"saas2/backend/handlers"
)

func RegisterCategoryRoutes(cat *gin.RouterGroup) {
	cat.GET("/", handlers.GetCategories)
	cat.POST("/", handlers.CreateCategory)
	cat.PUT("/:id", handlers.UpdateCategory)
	cat.DELETE("/:id", handlers.DeleteCategory)
}
