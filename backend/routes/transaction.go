package routes

import (
	"github.com/gin-gonic/gin"
	"saas2/backend/handlers"
)

func RegisterTransactionRoutes(r *gin.Engine) {
	   trx := r.Group("/api/transactions")
	   {
		   trx.POST("/", handlers.CreateTransaction)
		   trx.GET("/history", handlers.GetTransactionHistory)
		   trx.GET("/:id/invoice/pdf", handlers.PrintInvoicePDF)
	   }
}
