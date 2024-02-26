package main

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	go h.run()

	server := gin.Default()

	server.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"PUT", "PATCH", "POST", "OPTIONS"},
		// AllowHeaders:     []string{"Origin"},
		AllowHeaders:  []string{"Content-Type"},
		ExposeHeaders: []string{"Content-Length"},
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		MaxAge: 12 * time.Hour,
	}))

	server.GET("/ws/:roomid/:userName", func(c *gin.Context) {
		roomId := c.Param("roomid")
		userName := c.Param("userName")

		serverWs(c.Writer, c.Request, roomId, userName)
	})

	server.GET("/getrooms", func(c *gin.Context) {
		therooms := h.rooms

		var roomsNames []string

		for rm := range therooms {
			roomsNames = append(roomsNames, rm)
		}

		c.JSON(http.StatusAccepted, gin.H{"rooms": roomsNames})
	})
	server.Run((":1990"))
}
