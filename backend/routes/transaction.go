package routes

import (
	"github.com/gin-gonic/gin"
	"saas2/backend/handlers"
)

func RegisterTransactionRoutes(trx *gin.RouterGroup) {
   trx.GET("/", handlers.GetTransactionHistory)
   trx.POST("/", handlers.CreateTransaction)
   trx.GET("/history", handlers.GetTransactionHistory)
   trx.GET("/:id/invoice/pdf", handlers.PrintInvoicePDF)
}
