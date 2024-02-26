package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

type connection struct {
	ws                *websocket.Conn
	userName          string
	send              chan []byte
	membersUpdateChan chan []string
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		fmt.Println(r.Host)
		return true
	},
}

func (s subsription) readPump() {
	c := s.conn

	defer func() {
		h.unregister <- s
		c.ws.Close()
	}()

	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error { c.ws.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, msg, err := c.ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}
		m := message{data: msg, room: s.roomId}

		h.broadcast <- m
	}
}

// write writes a message with the given message type and payload.
func (c *connection) write(mt int, payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, payload)
}

func (s *subsription) writePump() {
	c := s.conn
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return
			}

			var data map[string]interface{}
			err := json.Unmarshal(message, &data)

			if err != nil {
				log.Println("Error encoding JSON:", err)
				return
			}

			event := map[string]interface{}{
				"event": "newMessage",
				"data":  data,
			}
			jsonData, err := json.Marshal(event)
			if err != nil {
				log.Println("Error encoding JSON:", err)
				return
			}
			if err := c.write(websocket.TextMessage, jsonData); err != nil {
				return
			}
		case roomMembers, ok := <-c.membersUpdateChan:
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return
			}
			event := map[string]interface{}{
				"event": "updateMembers",
				"data":  roomMembers,
			}
			jsonData, err := json.Marshal(event)
			if err != nil {
				log.Println("Error encoding JSON:", err)
				return
			}
			if err := c.write(websocket.TextMessage, jsonData); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.write(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}

}

func serverWs(w http.ResponseWriter, r *http.Request, roomId string, userName string) {

	ws, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Fatal(err.Error())
	}

	c := &connection{ws, userName, make(chan []byte, 256), make(chan []string, 256)}

	s := subsription{c, roomId}

	h.register <- s

	go s.writePump()
	go s.readPump()
}
