package routes

import (
	"github.com/gin-gonic/gin"
	"saas2/backend/handlers"
)

func RegisterProductRoutes(r *gin.Engine) {
	product := r.Group("/api/products")
	{
		product.GET("/", handlers.GetProducts)
		product.POST("/", handlers.CreateProduct)
		product.PUT(":id", handlers.UpdateProduct)
		product.DELETE(":id", handlers.DeleteProduct)
		product.POST("/upload-image", handlers.UploadProductImage)
	}
}
