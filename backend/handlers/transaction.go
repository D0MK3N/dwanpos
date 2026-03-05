
package handlers

import "log"

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jung-kurt/gofpdf"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"saas2/backend/database"
	"saas2/backend/models"
)

// Handler untuk generate invoice PDF custom
func PrintInvoicePDF(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	id := c.Param("id")
	var trx models.Transaction
	err := database.DB.Preload("Items").First(&trx, "id = ?", id).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Transaksi tidak ditemukan"})
		return
	}

	pdf := gofpdf.New("P", "mm", "A5", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "DWANPOS INVOICE")
	pdf.Ln(12)
	pdf.SetFont("Arial", "", 10)
	pdf.Cell(0, 8, fmt.Sprintf("ID: %s | Status: %s", trx.ID, trx.Status))
	pdf.Ln(8)
	pdf.Cell(0, 8, fmt.Sprintf("Tanggal: %s", trx.CreatedAt.Format("2006-01-02 15:04")))
	pdf.Ln(8)
	pdf.Cell(0, 8, fmt.Sprintf("Order: %s | Meja: %s", trx.OrderType, trx.TableNumber))
	pdf.Ln(8)
	pdf.Cell(0, 8, fmt.Sprintf("Kasir: %s", trx.UserID))
	pdf.Ln(8)
	pdf.Cell(0, 8, "Items:")
	pdf.Ln(8)
	for _, item := range trx.Items {
		pdf.Cell(0, 8, fmt.Sprintf("%s x%d @ %.2f = %.2f", item.ProductName, item.Qty, item.Price, item.Subtotal))
		pdf.Ln(8)
	}
	pdf.Cell(0, 8, fmt.Sprintf("Total: %.2f", trx.Total))
	pdf.Ln(8)
	pdf.Cell(0, 8, fmt.Sprintf("Cash: %.2f | Change: %.2f", trx.Cash, trx.Change))
	pdf.Ln(8)
	pdf.Cell(0, 8, fmt.Sprintf("Catatan: %s", trx.OrderNote))
	pdf.Ln(8)
	pdf.Cell(0, 8, "Terima kasih telah bertransaksi!")

	c.Header("Content-Type", "application/pdf")
	err = pdf.Output(c.Writer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal generate PDF"})
	}
}

type TransactionRequest struct {
	UserID      string  `json:"user_id"`
	Cash        float64 `json:"cash"`
	OrderType   string  `json:"order_type"`
	TableNumber string  `json:"table_number"`
	OrderNote   string  `json:"order_note"`
	Items       []struct {
		ProductID   string  `json:"product_id"`
		ProductName string  `json:"product_name"`
		Price       float64 `json:"price"`
		Qty         int     `json:"qty"`
	} `json:"items"`
}

func CreateTransaction(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	var req TransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid data", "data": nil})
		return
	}
	if len(req.Items) == 0 || req.Cash <= 0 || req.OrderType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Data transaksi tidak lengkap", "data": nil})
		return
	}
	if req.OrderType == "Dine-in" && req.TableNumber == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Nomor meja wajib diisi untuk Dine-in", "data": nil})
		return
	}

	for _, item := range req.Items {
		if item.ProductID == "" || item.Qty <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Item transaksi tidak valid", "data": nil})
			return
		}
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal memulai transaksi database", "data": nil})
		return
	}

	trxID := fmt.Sprintf("TRX%d", time.Now().UnixNano())
	total := 0.0
	items := make([]models.TransactionItem, 0, len(req.Items))

	for index, reqItem := range req.Items {
		var product database.Product
		err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, "id = ?", reqItem.ProductID).Error
		if err != nil {
			tx.Rollback()
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": fmt.Sprintf("Produk %s tidak ditemukan", reqItem.ProductID), "data": nil})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal mengambil data produk", "data": nil})
			return
		}

		if product.Stock < reqItem.Qty {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": fmt.Sprintf("Stok produk %s tidak cukup", product.Name), "data": nil})
			return
		}

		result := tx.Model(&database.Product{}).
			Where("id = ? AND stock >= ?", product.ID, reqItem.Qty).
			Update("stock", gorm.Expr("stock - ?", reqItem.Qty))
		if result.Error != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal update stok produk", "data": nil})
			return
		}
		if result.RowsAffected == 0 {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": fmt.Sprintf("Stok produk %s tidak cukup", product.Name), "data": nil})
			return
		}

		subtotal := product.Price * float64(reqItem.Qty)
		total += subtotal

		items = append(items, models.TransactionItem{
			ID:            fmt.Sprintf("%s_ITEM_%d", trxID, index+1),
			TransactionID: trxID,
			ProductID:     product.ID,
			ProductName:   product.Name,
			Price:         product.Price,
			Qty:           reqItem.Qty,
			Subtotal:      subtotal,
		})
	}

	if req.Cash < total {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Uang tunai kurang dari total", "data": nil})
		return
	}

	now := time.Now()
	trx := models.Transaction{
		ID:          trxID,
		UserID:      req.UserID,
		Total:       total,
		Cash:        req.Cash,
		Change:      req.Cash - total,
		Status:      "paid",
		OrderType:   req.OrderType,
		TableNumber: req.TableNumber,
		OrderNote:   req.OrderNote,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := tx.Create(&trx).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menyimpan transaksi", "data": nil})
		return
	}

	if len(items) > 0 {
		if err := tx.Create(&items).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal menyimpan item transaksi", "data": nil})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal commit transaksi", "data": nil})
		return
	}

	trx.Items = items
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Transaksi berhasil disimpan", "data": trx})
}

// Endpoint untuk cetak struk/invoice sederhana
func PrintInvoice(c *gin.Context) {
		log.Printf("[%s] [INFO] %s %s", time.Now().Format("2006-01-02 15:04:05"), c.Request.Method, c.FullPath())
	id := c.Param("id")
	var trx models.Transaction
	err := database.DB.Preload("Items").First(&trx, "id = ?", id).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Transaksi tidak ditemukan", "data": nil})
		return
	}
	// Contoh format invoice sederhana (bisa dikembangkan ke PDF/HTML)
	invoice := fmt.Sprintf("Invoice\nID: %s\nStatus: %s\nTotal: %.2f\nOrderType: %s\nTable: %s\nNote: %s\n\nItems:\n", trx.ID, trx.Status, trx.Total, trx.OrderType, trx.TableNumber, trx.OrderNote)
	for _, item := range trx.Items {
		invoice += fmt.Sprintf("- %s x%d @ %.2f = %.2f\n", item.ProductName, item.Qty, item.Price, item.Subtotal)
	}
	invoice += fmt.Sprintf("\nCash: %.2f\nChange: %.2f\n", trx.Cash, trx.Change)
		c.JSON(http.StatusOK, gin.H{"success": true, "invoice": invoice})
	}

