package routes

import (
  "github.com/gin-gonic/gin"
  "saas2/backend/handlers"
)

func RegisterSubscriptionRoutes(r *gin.Engine) {
	r.GET("/subscriptions", handlers.GetUserSubscriptions)
	r.POST("/subscriptions", handlers.CreateUserSubscription)
}
