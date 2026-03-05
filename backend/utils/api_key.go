package utils

import (
    "crypto/rand"
    "encoding/hex"
)

func GenerateApiKey() string {
    b := make([]byte, 32)
    n, err := rand.Read(b)
    if err != nil || n != len(b) {
        return ""
    }
    return hex.EncodeToString(b)
}
