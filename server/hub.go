package main

import (
	"fmt"
)

type subsription struct {
	conn   *connection
	roomId string
}

type message struct {
	data []byte
	room string
}

type hub struct {
	rooms      map[string]map[*connection]bool
	broadcast  chan message
	register   chan subsription
	unregister chan subsription
}

var h = hub{
	rooms:      make(map[string]map[*connection]bool),
	broadcast:  make(chan message),
	register:   make(chan subsription),
	unregister: make(chan subsription),
}

func returnActiveUserUsers(conns map[*connection]bool) []string {
	var users []string

	for c := range conns {
		if conns[c] == true {
			users = append(users, c.userName)
		}
	}
	return users
}

func (h *hub) run() {

	for {
		select {
		case s := <-h.register:
			connections := h.rooms[s.roomId]
			if connections == nil {
				connections = make(map[*connection]bool)
				h.rooms[s.roomId] = connections
			}
			h.rooms[s.roomId][s.conn] = true

			activeUsers := returnActiveUserUsers(h.rooms[s.roomId])

			for c := range connections {
				select {
				case c.membersUpdateChan <- activeUsers:
				default:
					close(c.membersUpdateChan)
				}
			}

			fmt.Println(h.rooms[s.roomId])
		case s := <-h.unregister:
			fmt.Println("in unregistering")
			connections := h.rooms[s.roomId]
			if connections != nil {
				if _, ok := connections[s.conn]; ok {
					delete(connections, s.conn)
					close(s.conn.send)
					if len(connections) == 0 {
						delete(h.rooms, s.roomId)
					}
				}
			}
			activeUsers := returnActiveUserUsers(h.rooms[s.roomId])

			for c := range connections {
				select {
				case c.membersUpdateChan <- activeUsers:
				default:
					close(c.membersUpdateChan)
				}
			}
		case m := <-h.broadcast:
			connections := h.rooms[m.room]
			for c := range connections {
				select {
				case c.send <- m.data:
				default:
					close(c.send)
					delete(connections, c)
					if len(connections) == 0 {
						delete(h.rooms, m.room)
					}
				}
			}
		}
	}

}
