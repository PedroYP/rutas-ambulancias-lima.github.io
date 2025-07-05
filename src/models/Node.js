import Edge from "./Edge";

/**
 * @typedef {Object} NodeNeighbor
 * @property {Node} node
 * @property {Edge} edge
 */

export default class Node {

    /**
     * 
     * @param {Number} id 
     * @param {Number} latitude 
     * @param {Number} longitude 
     */
    constructor(id, latitude, longitude) {
        this.edges = [];
        this.reset();
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.visited = false;
    }

    /**
     * @returns {Number} f heuristics
     */
    get totalDistance() {
        return this.distanceFromStart + this.distanceToEnd;
    }

    /**
     * @returns {NodeNeighbor[]} list of neighbors 
     */
    get neighbors() {
        return this.edges.map(edge => ({ edge, node: edge.getOtherNode(this)}));
    }

    /**
     * 
     * @param {Node} node 
     */
    connectTo(node) {
        const edge = new Edge(this, node);
        this.edges.push(edge);
        node.edges.push(edge);
    }

    /**
     * Reset node to default state
     */
    reset() {
        this.visited = false;
        this.distanceFromStart = 0;
        this.distanceToEnd = 0;
        this.parent = null;
        this.referer = null;

        for(const neighbor of this.neighbors) {
            neighbor.edge.visited = false;
        }
    }

    /**
     * Create a deep copy of this node for independent algorithm execution
     * @param {Map} nodeMap - Map to track cloned nodes
     * @param {Map} edgeMap - Map to track cloned edges
     * @returns {Node} cloned node
     */
    clone(nodeMap, edgeMap) {
        // If already cloned, return existing clone
        if (nodeMap.has(this.id)) {
            return nodeMap.get(this.id);
        }

        // Create new node
        const clonedNode = new Node(this.id, this.latitude, this.longitude);
        clonedNode.visited = this.visited;
        clonedNode.distanceFromStart = this.distanceFromStart;
        clonedNode.distanceToEnd = this.distanceToEnd;
        clonedNode.parent = null; // Will be set during cloning process
        clonedNode.referer = null; // Will be set during cloning process

        // Register in map
        nodeMap.set(this.id, clonedNode);

        return clonedNode;
    }

    /**
     * Clone edges after all nodes have been cloned
     * @param {Node} originalNode - Original node with edges
     * @param {Map} nodeMap - Map of cloned nodes
     * @param {Map} edgeMap - Map of cloned edges
     */
    cloneEdges(originalNode, nodeMap, edgeMap) {
        this.edges = [];
        
        for (const edge of originalNode.edges) {
            const edgeKey = `${edge.node1.id}-${edge.node2.id}`;
            const reverseKey = `${edge.node2.id}-${edge.node1.id}`;
            
            // Check if edge already exists
            if (edgeMap.has(edgeKey) || edgeMap.has(reverseKey)) {
                const existingEdge = edgeMap.get(edgeKey) || edgeMap.get(reverseKey);
                this.edges.push(existingEdge);
                continue;
            }

            // Get cloned nodes
            const clonedNode1 = nodeMap.get(edge.node1.id);
            const clonedNode2 = nodeMap.get(edge.node2.id);

            if (clonedNode1 && clonedNode2) {
                // Create new edge
                const clonedEdge = new Edge(clonedNode1, clonedNode2);
                clonedEdge.visited = edge.visited;
                
                // Register edge
                edgeMap.set(edgeKey, clonedEdge);
                
                // Add to both nodes if not already added
                if (!this.edges.includes(clonedEdge)) {
                    this.edges.push(clonedEdge);
                }
                if (clonedNode1.id !== this.id && !clonedNode1.edges.includes(clonedEdge)) {
                    clonedNode1.edges.push(clonedEdge);
                }
                if (clonedNode2.id !== this.id && !clonedNode2.edges.includes(clonedEdge)) {
                    clonedNode2.edges.push(clonedEdge);
                }
            }
        }
    }
}