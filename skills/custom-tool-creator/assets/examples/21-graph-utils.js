// Example 21: Graph Utilities
// Demonstrates tree/graph traversal algorithms

module.exports = async function({ parameters }) {
  const { action, graph, startNode, targetNode } = parameters;

  if (!graph || typeof graph !== 'object') {
    throw new Error('graph must be an object with adjacency list');
  }

  const result = { success: true, action };

  switch (action) {
    case 'bfs':
      if (!startNode) throw new Error('startNode required for BFS');
      result.visited = bfs(graph, startNode);
      break;

    case 'dfs':
      if (!startNode) throw new Error('startNode required for DFS');
      result.visited = dfs(graph, startNode);
      break;

    case 'shortest-path':
      if (!startNode || !targetNode) {
        throw new Error('startNode and targetNode required for shortest-path');
      }
      result.path = shortestPath(graph, startNode, targetNode);
      result.found = result.path !== null;
      break;

    case 'has-cycle':
      result.hasCycle = detectCycle(graph);
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return result;
};

function bfs(graph, start) {
  const visited = [];
  const queue = [start];
  const seen = new Set([start]);

  while (queue.length > 0) {
    const node = queue.shift();
    visited.push(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return visited;
}

function dfs(graph, start) {
  const visited = [];
  const stack = [start];
  const seen = new Set();

  while (stack.length > 0) {
    const node = stack.pop();
    if (!seen.has(node)) {
      seen.add(node);
      visited.push(node);
      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        if (!seen.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return visited;
}

function shortestPath(graph, start, target) {
  if (start === target) return [start];

  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];
    const neighbors = graph[node] || [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;

      const newPath = [...path, neighbor];
      if (neighbor === target) return newPath;

      visited.add(neighbor);
      queue.push(newPath);
    }
  }

  return null; // No path found
}

function detectCycle(graph) {
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node) {
    if (recursionStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node of Object.keys(graph)) {
    if (dfs(node)) return true;
  }

  return false;
}

/**
 * Graph algorithms for:
 * - BFS/DFS traversal
 * - Shortest path finding
 * - Cycle detection
 *
 * Input graph format (adjacency list):
 * {
 *   "A": ["B", "C"],
 *   "B": ["D"],
 *   "C": ["D"],
 *   "D": []
 * }
 */