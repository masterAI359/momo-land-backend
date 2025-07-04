let io = null

const setSocketIO = (socketIO) => {
  io = socketIO
}

const getSocketIO = () => {
  return io
}

const emitToRoom = (room, event, data) => {
  if (io) {
    console.log(`📡 Emitting to room "${room}": ${event}`, data)
    io.to(room).emit(event, data)
  } else {
    console.log("❌ Cannot emit - no socket.io instance")
  }
}

const emitToAll = (event, data) => {
  if (io) {
    console.log(`📡 Emitting to all: ${event}`, data)
    io.emit(event, data)
  } else {
    console.log("❌ Cannot emit - no socket.io instance")
  }
}

module.exports = {
  setSocketIO,
  getSocketIO,
  emitToRoom,
  emitToAll
} 