package routes

import (
	"github.com/gin-gonic/gin"
	"saas2/backend/handlers"
)

func RegisterProductRoutes(product *gin.RouterGroup) {
	product.GET("/", handlers.GetProducts)
	product.POST("/", handlers.CreateProduct)
	product.PUT("/:id", handlers.UpdateProduct)
	product.DELETE("/:id", handlers.DeleteProduct)
	product.POST("/upload-image", handlers.UploadProductImage)
}
