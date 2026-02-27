package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"saas2/backend/database"
	"saas2/backend/handlers"
	"saas2/backend/middleware"
	"saas2/backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	r := gin.Default()
	// CORS configuration (must be at the very top, before any routes)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "https://unhanged-tabatha-drumliest.ngrok-free.dev"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	// Handle OPTIONS preflight for CORS
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(200)
	})
	// ============================================
	// AUTH ROUTES
	// ============================================
	auth := r.Group("/auth")
	auth.POST("/register", handlers.Register)
	auth.POST("/login", handlers.Login)

	// ============================================
	// AUTH ROUTES
	// ============================================
	auth.POST("/logout", handlers.Logout)
	auth.GET("/verify", handlers.VerifyEmail)
	// Password change (protected)
	auth.POST("/change-password", middleware.AuthMiddleware(), handlers.ChangePassword)
	// (removed: PATCH /api/payments/:id)
	// (Moved below, after 'protected' is defined)

	// ============================================
	// AUTH ME ROUTE (cookie-based user info)
	// ============================================
	api := r.Group("/api")
	api.GET("/auth/me", handlers.Me)
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  Warning: .env file not found, using system environment variables")
	} else {
		log.Println("✅ Successfully loaded .env file")
	}

	log.Println("[DEBUG] Reached before DB init")
	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}
	log.Println("[DEBUG] DB init successful")

	// Auto migrate database tables
	if err := database.MigrateDB(); err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// r = gin.Default() // REMOVE this duplicate, only use one Gin engine

	// (removed duplicate CORS config, only keep the first one with ngrok domain)

	// ============================================
	// PAYMENT ROUTES REMOVED (PayPal & Stripe)
	// ============================================
	// ...existing code...

	// ============================================
	// SUBSCRIPTION ROUTES
	// ============================================
	subscription := r.Group("/api/subscriptions")
	subscription.GET("", handlers.GetUserSubscriptions) // Admin endpoint
	// subscription.GET("", handlers.GetAllSubscriptions) // Admin endpoint (Dihapus)

	// Register subscription routes
	routes.RegisterSubscriptionRoutes(r)

	// ============================================
	// ADMIN ROUTES
	// ============================================
	// ADMIN ROUTES (Dihapus)
	// admin := r.Group("/api/admin")
	// admin.GET("/stats", handlers.GetDashboardStats)
	// admin.GET("/subscriptions/by-plan", handlers.GetSubscriptionsByPlan)

	    // ============================================
	    // PROTECTED USER ROUTES
	    // ============================================
		protected := r.Group("/api")
		protected.Use(middleware.AuthMiddleware())
		protected.GET("/profile", handlers.Profile)
		protected.GET("/user/subscription", handlers.GetUserSubscription)
		protected.POST("/user/upgrade", handlers.UpgradeSubscription)
		// (removed: protected payments endpoints)

		// Register dashboard stats endpoint for authenticated users
		protected.GET("/stats", handlers.GetDashboardStats)


	// ============================================
	// PUBLIC API ROUTES
	// ============================================
	r.GET("/api/plans", handlers.GetPlans)

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		db, err := database.DB.DB()
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status":  "ERROR",
				"service": "SaaS Backend",
				"error":   "Database connection failed",
				"time":    time.Now().Format(time.RFC3339),
			})
			return
		}

		if err := db.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status":  "ERROR",
				"service": "SaaS Backend",
				"error":   "Database ping failed",
				"time":    time.Now().Format(time.RFC3339),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":   "OK",
			"service":  "SaaS Backend",
			"time":     time.Now().Format(time.RFC3339),
			   // (removed: payments array)
		})
	})

	// 404 handler
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Endpoint not found",
		})
	})

	// Start server with graceful shutdown
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}


		// Register product routes (public, for POS & Android)
		routes.RegisterProductRoutes(r)

		// Register category routes (public, for POS & Android)
		routes.RegisterCategoryRoutes(r)

		// Register transaction routes (POS kasir)
		routes.RegisterTransactionRoutes(r)

	   srv := &http.Server{
		   Addr:    ":" + port,
		   Handler: r,
	   }

	   // Build modern log banner
	   projectName := "DWANPOS SaaS Backend"
	   version := "v1.0.0"
	   startedAt := time.Now().Format("2006-01-02 15:04:05")
	   env := os.Getenv("GIN_MODE")
	   if env == "" {
		   env = "Development"
	   }
	   apiList := "/api/products, /api/categories, /api/transactions"

	   // ANSI color codes
	   cyan := "\033[36m"
	   green := "\033[32m"
	   yellow := "\033[33m"
	   magenta := "\033[35m"
	   blue := "\033[34m"
	   reset := "\033[0m"
	   bold := "\033[1m"

	   log.Printf("\n"+
		   cyan+bold+"┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"+reset+"\n"+
		   magenta+bold+"┃   🚀 %s %s"+reset+"\t\t\t\t\t\t\t"+magenta+bold+"┃"+reset+"\n"+
		   blue+"┃   🕒 Started: %s"+reset+"\t\t\t\t\t"+blue+"┃"+reset+"\n"+
		   cyan+bold+"┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃"+reset+"\n"+
		   green+"┃ 🌐 Server:     http://localhost:%s"+reset+"\t\t\t\t\t"+green+"┃"+reset+"\n"+
		   green+"┃ 🗄️  Database:   "+bold+"✓ Connected"+reset+green+"\t\t\t\t\t\t┃"+reset+"\n"+
		   yellow+"┃ 🏷️  Env:        %s"+reset+"\t\t\t\t\t\t"+yellow+"┃"+reset+"\n"+
		   "┃                                                      \t\t┃\n"+
		   magenta+"┃ 🔗 API:        %s"+reset+"\t\t\t\t"+magenta+"┃"+reset+"\n"+
		   "┃                                                      \t\t┃\n"+
		   green+bold+"┃ ✅ Status:     Running"+reset+green+"\t\t\t\t\t\t┃"+reset+"\n"+
		   cyan+bold+"┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"+reset+"\n",
		   projectName, version, startedAt, port, env, apiList)

	// Start server in goroutine
	go func() {
		log.Printf("Server started on port %s with database connected", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")

}
