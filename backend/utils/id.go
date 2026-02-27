// backend/utils/id.go
package utils

import (
	"fmt"
	"math/rand"
	"time"
)

// GenerateUserID menghasilkan ID unik untuk user
func GenerateUserID() string {
	return fmt.Sprintf("user_%d_%d", time.Now().Unix(), rand.Intn(100000))
}

// GenerateSubscriptionID menghasilkan ID unik untuk subscription
func GenerateSubscriptionID() string {
	return fmt.Sprintf("sub_%d_%d", time.Now().Unix(), rand.Intn(100000))
}

// GeneratePaymentID menghasilkan ID unik untuk payment
func GeneratePaymentID() string {
	return fmt.Sprintf("pay_%d_%d", time.Now().Unix(), rand.Intn(100000))
}
