export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe('public')
  },
  message(peer, message) {
    const obj = JSON.parse(message.text())
    peer.publish('public', obj)
  },
  close(peer) {
    peer.unsubscribe('public')
  }
})
