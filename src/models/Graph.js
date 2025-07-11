import Node from "./Node";

export default class Graph {
    constructor() {
        this.startNode = null;
        this.nodes = new Map();
    }

    /**
     * 
     * @param {Number} id 
     * @returns node with given Id
     */
    getNode(id) {
        return this.nodes.get(id);
    }

    /**
     * 
     * @param {Number} id node id
     * @param {Number} latitude node latitude
     * @param {Number} longitude node longitude
     * @returns {Node} created node
     */
    addNode(id, latitude, longitude) {
        const node = new Node(id, latitude, longitude);
        this.nodes.set(node.id, node);
        return node;
    }

    /**
     * Create a deep copy of this graph for independent algorithm execution
     * @returns {Graph} cloned graph
     */
    clone() {
        const clonedGraph = new Graph();
        const nodeMap = new Map();
        const edgeMap = new Map();

        // First pass: clone all nodes
        for (const [id, node] of this.nodes) {
            const clonedNode = node.clone(nodeMap, edgeMap);
            clonedGraph.nodes.set(id, clonedNode);
        }

        // Second pass: clone all edges
        for (const [id, node] of this.nodes) {
            const clonedNode = clonedGraph.nodes.get(id);
            clonedNode.cloneEdges(node, nodeMap, edgeMap);
        }

        // Set start node if exists
        if (this.startNode) {
            clonedGraph.startNode = clonedGraph.nodes.get(this.startNode.id);
        }

        return clonedGraph;
    }
}