const crypto = require('crypto')
const express = require('express')
const url = require('url')
const cors = require('cors')
class ConsistentHashing {
  constructor (replicas = 3) {
    this.nodes = new Map()
    this.replicas = replicas
  }

  addNode (node) {
    for (let i = 0; i < this.replicas; i++) {
      const hash = this.hash(node + i)
      this.nodes.set(hash, node)
    }
  }

  removeNode (node) {
    for (let i = 0; i < this.replicas; i++) {
      const hash = this.hash(node + i)
      this.nodes.delete(hash)
    }
  }

  getNodeForKey (key) {
    if (this.nodes.size === 0) {
      return null
    }

    const hash = this.hash(key)
    const keys = Array.from(this.nodes.keys())
    const sortedKeys = keys.sort((a, b) => a - b)

    for (const nodeHash of sortedKeys) {
      if (hash <= nodeHash) {
        return this.nodes.get(nodeHash)
      }
    }

    // Wrap around to the first node if key hash is greater than the highest node hash
    return this.nodes.get(sortedKeys[0])
  }

  hash (input) {
    const hash = crypto.createHash('sha1')
    hash.update(input)
    return parseInt(hash.digest('hex').slice(0, 8), 16)
  }
}

// Example usage
const consistentHashing = new ConsistentHashing()

// consistentHashing.addNode('Node1')
// consistentHashing.addNode('Node2')
// consistentHashing.addNode('Node3')

// // Get node for a key
// const key = 'some_key'
// const node = consistentHashing.getNodeForKey(key)

// console.log(`Key '${key}' is mapped to Node: ${node}`)

// // Remove a node
// consistentHashing.removeNode('Node3')

// // Get node for the same key after removing a node
// const updatedNode = consistentHashing.getNodeForKey(key)

// console.log(`Key '${key}' is now mapped to Node: ${updatedNode}`)
const app = express()
app.use(express.json())
app.use(cors())

const PORT = 3600
// Endpoint to add a server
app.post('/add-server', (req, res) => {
  const { port } = req.body
  if (port) {
    consistentHashing.addNode(`http://localhost:${port}`)
    res.status(200).send(`Server added at port ${port}`)
  } else {
    res.status(400).send('Port number is required')
  }
})

// Endpoint to delete a server
app.post('/delete-server', (req, res) => {
  const { port } = req.body
  if (port) {
    consistentHashing.removeNode(`http://localhost:${port}`)
    res.status(200).send(`Server removed at port ${port}`)
  } else {
    res.status(400).send('Port number is required')
  }
})

// Endpoint to allocate a server for a key
app.get('/allocate-server', (req, res) => {
  const { key } = req.query
  if (key) {
    const allocatedServer = consistentHashing.getNodeForKey(key)
    if (allocatedServer) {
      res.status(200).send(`${allocatedServer}`)
    } else {
      res.status(500).send('No server available')
    }
  } else {
    res.status(400).send('Key is required')
  }
})

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
