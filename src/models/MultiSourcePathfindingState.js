import AStar from "./algorithms/AStar";
import Dijkstra from "./algorithms/Dijkstra";
import PathfindingAlgorithm from "./algorithms/PathfindingAlgorithm";
import { MULTI_SOURCE_COLORS } from "../config";

export default class MultiSourcePathfindingState {
    static #instance;

    /**
     * Singleton class para manejo de múltiples fuentes de pathfinding
     * @returns {MultiSourcePathfindingState}
     */
    constructor() {
        if (!MultiSourcePathfindingState.#instance) {
            this.endNode = null;
            this.graph = null;
            this.finished = false;
            this.startNodes = []; // Array de nodos de inicio
            this.algorithms = []; // Array de algoritmos, uno por cada startNode
            this.algorithmResults = []; // Resultados de cada algoritmo
            this.colors = []; // Colores para cada ruta
            this.independentGraphs = []; // Grafos independientes para cada algoritmo
            this.optimalPaths = []; // Rutas óptimas encontradas
            MultiSourcePathfindingState.#instance = this;
        }
    
        return MultiSourcePathfindingState.#instance;
    }

    /**
     * 
     * @param {Number} id OSM node id
     * @returns {import("./Node").default} node
     */
    getNode(id) {
        return this.graph?.getNode(id);
    }




    /**
     * Busca el nodo más cercano en el grafo cargado a una coordenada específica.
     * @param {number} lon Longitud
     * @param {number} lat Latitud
     * @returns {import("./Node").default | null} El nodo más cercano o null.
     */
    findNearestNodeInGraph(lon, lat) {
        if (!this.graph || !this.graph.nodes) return null;

        let closestNode = null;
        let minDistance = Infinity;

        // Itera sobre los nodos del grafo para encontrar el más cercano
        for (const node of this.graph.nodes.values()) {
            // Usamos una distancia euclidiana simple, es suficientemente precisa para esto
            const distance = Math.hypot(node.longitude - lon, node.latitude - lat);
            if (distance < minDistance) {
                minDistance = distance;
                closestNode = node;
            }
        }
        
        // Devolvemos una copia para no mutar el estado original del nodo por accidente
        if (closestNode) {
            return { ...closestNode, originalId: closestNode.id };
        }
        
        return null;
    }











    /**
     * Genera colores únicos para cada algoritmo
     */
    generateColors() {
        this.colors = [];
        for (let i = 0; i < this.startNodes.length; i++) {
            this.colors.push(MULTI_SOURCE_COLORS[i % MULTI_SOURCE_COLORS.length]);
        }
    }

    /**
     * Añade un nodo de inicio
     * @param {import("./Node").default} startNode 
     */
    addStartNode(startNode) {
        if (!this.startNodes.find(node => node.id === startNode.id)) {
            this.startNodes.push(startNode);
            this.generateColors();
        }
    }

    /**
     * Elimina un nodo de inicio
     * @param {import("./Node").default} startNode 
     */
    removeStartNode(startNode) {
        const index = this.startNodes.findIndex(node => node.id === startNode.id);
        if (index !== -1) {
            this.startNodes.splice(index, 1);
            this.generateColors();
        }
    }

    /**
     * Limpia todos los nodos de inicio
     */
    clearStartNodes() {
        this.startNodes = [];
        this.algorithms = [];
        this.algorithmResults = [];
        this.colors = [];
        this.independentGraphs = [];
        this.optimalPaths = [];
    }

    /**
     * Resets to default state
     */
    reset() {
        this.finished = false;
        if(!this.graph) return;
        
        // Reset all nodes in original graph
        for(const key of this.graph.nodes.keys()) {
            this.graph.nodes.get(key).reset();
        }

        // Reset algorithm results
        this.algorithmResults = [];
        for (let i = 0; i < this.startNodes.length; i++) {
            this.algorithmResults.push({
                finished: false,
                updatedNodes: [],
                color: this.colors[i] || [128, 128, 128],
                algorithmIndex: i,
                justFinished: false
            });
        }

        // Reset algorithms and independent graphs
        this.algorithms = [];
        this.independentGraphs = [];
        this.optimalPaths = [];
    }

    /**
     * Resets state and initializes new pathfinding animation with multiple sources
     */
    start(algorithmType) {
        this.reset();
        this.algorithms = [];
        this.independentGraphs = [];
        this.optimalPaths = [];

        // Create an independent graph and algorithm instance for each start node
        for (let i = 0; i < this.startNodes.length; i++) {
            // Clone the graph for this algorithm to ensure independence
            const independentGraph = this.graph.clone();
            this.independentGraphs.push(independentGraph);

            // Get the corresponding nodes in the cloned graph
            const independentStartNode = independentGraph.getNode(this.startNodes[i].id);
            const independentEndNode = independentGraph.getNode(this.endNode.id);

            let algorithm;
            switch(algorithmType) {
                case "astar":
                    algorithm = new AStar();
                    break;
                case "dijkstra":
                    algorithm = new Dijkstra();
                    break;
                default:
                    algorithm = new AStar();
                    break;
            }

            algorithm.start(independentStartNode, independentEndNode);
            algorithm.sourceIndex = i; // Add source index for tracking
            algorithm.independentGraph = independentGraph; // Store reference to independent graph
            this.algorithms.push(algorithm);
            
            // Initialize optimal path storage
            this.optimalPaths.push(null);
        }
    }

    /**
     * Progresses all pathfinding algorithms by one step/iteration
     * @returns {Array} array of results for each algorithm
     */
    nextStep() {
        const allResults = [];
        let allFinished = true;

        for (let i = 0; i < this.algorithms.length; i++) {
            const algorithm = this.algorithms[i];
            let updatedNodes = [];
            
            if (!algorithm.finished) {
                updatedNodes = algorithm.nextStep();
                
                // Check if this algorithm just finished
                if (algorithm.finished && !this.optimalPaths[i]) {
                    // Store the optimal path
                    this.optimalPaths[i] = this.extractOptimalPath(algorithm, i);
                }
                
                allFinished = false;
            }
            
            // Map nodes from independent graph back to original graph for visualization
            const nodeResults = updatedNodes.map(node => {
                // Find corresponding node in original graph
                const originalNode = this.graph.getNode(node.id);
                const originalReferer = node.referer ? this.graph.getNode(node.referer.id) : null;
                
                // Copy visualization properties to original node for proper display
                if (originalNode && originalReferer) {
                    originalNode.referer = originalReferer;
                }
                
                return {
                    node: originalNode, // Use original node for visualization
                    color: this.colors[i],
                    sourceIndex: i
                };
            });

            // Always report algorithm status, even if finished
            const algorithmResult = {
                algorithmIndex: i,
                updatedNodes: nodeResults,
                finished: algorithm.finished,
                color: this.colors[i],
                justFinished: algorithm.finished && !this.algorithmResults[i]?.finished
            };

            allResults.push(algorithmResult);

            this.algorithmResults[i] = {
                finished: algorithm.finished,
                updatedNodes: nodeResults,
                color: this.colors[i],
                algorithmIndex: i,
                justFinished: algorithmResult.justFinished
            };
        }

        if (allFinished) {
            this.finished = true;
        }

        return allResults;
    }

    /**
     * Extract optimal path from finished algorithm
     * @param {PathfindingAlgorithm} algorithm - The finished algorithm
     * @param {number} algorithmIndex - Index of the algorithm
     * @returns {Array} Array of node IDs representing the optimal path
     */
    extractOptimalPath(algorithm, algorithmIndex) {
        const path = [];
        let currentNode = algorithm.endNode;

        // Trace back from end to start using parent pointers
        while (currentNode && currentNode.parent) {
            path.unshift(currentNode.id); // Add to beginning of array
            currentNode = currentNode.parent;
        }
        
        // Add start node
        if (currentNode) {
            path.unshift(currentNode.id);
        }

        return path;
    }

    /**
     * Get optimal path for a specific algorithm
     * @param {number} algorithmIndex - Index of the algorithm
     * @returns {Array} Array of node IDs or null if not found
     */
    getOptimalPath(algorithmIndex) {
        return this.optimalPaths[algorithmIndex];
    }

    /**
     * Get all optimal paths found so far
     * @returns {Array} Array of paths (each path is an array of node IDs)
     */
    getAllOptimalPaths() {
        return this.optimalPaths.filter(path => path !== null);
    }

    /**
     * Get the color for a specific algorithm/source
     */
    getColorForSource(sourceIndex) {
        return this.colors[sourceIndex] || [128, 128, 128];
    }

    /**
     * Check if any algorithm has finished
     */
    hasAnyFinished() {
        return this.algorithms.some(algorithm => algorithm.finished);
    }

    /**
     * Get all finished algorithms
     */
    getFinishedAlgorithms() {
        return this.algorithms.filter(algorithm => algorithm.finished);
    }
}
