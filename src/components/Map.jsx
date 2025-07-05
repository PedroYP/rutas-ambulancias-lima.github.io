/*Map.jsx - Modificado para usar hospitales como puntos de partida*/
/*VERSION MEJORADA 2 - Con Hover Tooltip y distancia de rutas*/
import DeckGL from "@deck.gl/react";
import { Map as MapGL } from "react-map-gl";
import maplibregl from "maplibre-gl";
import { PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import { FlyToInterpolator } from "deck.gl";
import { TripsLayer } from "@deck.gl/geo-layers";
import { createGeoJSONCircle } from "../helpers";
import { useEffect, useRef, useState } from "react";
import { getBoundingBoxFromPolygon, getMapGraph, getNearestNode } from "../services/MapService";
import PathfindingState from "../models/PathfindingState";
import MultiSourcePathfindingState from "../models/MultiSourcePathfindingState";
import Interface from "./Interface";
import { INITIAL_COLORS, INITIAL_VIEW_STATE, MAP_STYLE, HEALTH_FACILITIES} from "../config";
import useSmoothStateChange from "../hooks/useSmoothStateChange";

// Lista de hospitales predefinidos
// const HEALTH_FACILITIES = [
//     // Hospitales (añade los que obtuvimos de la herramienta)
//     { id: 'hosp1', name: 'Hospital Nacional Dos De Mayo', longitude: -77.01461873374852, latitude: -12.056258406493845, type: 'hospital', activated: false },
//     { id: 'hosp2', name: 'Hospital Arzobispo Loayza', longitude: -77.0445661439587, latitude: -12.048339681656948, type: 'hospital', activated: false },
//     { id: 'hosp3', name: 'Hospital EsSalud Angamos', longitude: -77.02805791633861, latitude: -12.11361251073139, type: 'hospital', activated: false },
//     { id: 'hosp4', name: 'Hospital Nacional Docente Madre Niño San Bartolomé', longitude: -77.04227899695132, latitude: -12.049768382106826, type: 'hospital', activated: false },
//     { id: 'hosp5', name: 'Hospital Santa Rosa', longitude: -77.06151026922002, latitude: -12.071818994736823, type: 'hospital', activated: false },
// ];

function Map() {
    const [activatedHospitals, setActivatedHospitals] = useState([]); // Hospitales activados
    const [hospitalRouteDistances, setHospitalRouteDistances] = useState({}); // Distancias de rutas por hospital
    const [endNode, setEndNode] = useState(null);
    const [selectionRadius, setSelectionRadius] = useState([]);
    const [tripsData, setTripsData] = useState([]);
    const [started, setStarted] = useState();
    const [time, setTime] = useState(0);
    const [animationEnded, setAnimationEnded] = useState(false);
    const [playbackOn, setPlaybackOn] = useState(false);
    const [playbackDirection, setPlaybackDirection] = useState(1);
    const [fadeRadiusReverse, setFadeRadiusReverse] = useState(false);
    
    // Estados para el hover tooltip
    const [hoveredHospital, setHoveredHospital] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({ algorithm: "astar", radius: 4, speed: 5 });
    const [colors, setColors] = useState(INITIAL_COLORS);
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const ui = useRef();
    const fadeRadius = useRef();
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const timer = useRef(0);
    const waypoints = useRef([]);
    const multiState = useRef(new MultiSourcePathfindingState());
    const traceNodes = useRef([]);
    const optimalPathTracing = useRef(false);
    const optimalPathNodes = useRef([]);
    const selectionRadiusOpacity = useSmoothStateChange(0, 0, 1, 400, fadeRadius.current, fadeRadiusReverse);

    // Función para calcular distancia entre dos puntos (Haversine)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Función para calcular distancia de una ruta (suma de distancias entre nodos consecutivos)
    function calculateRouteDistance(path) {
        if (!path || path.length < 2) return 0;
        
        let totalDistance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const node1 = multiState.current.getNode(path[i]);
            const node2 = multiState.current.getNode(path[i + 1]);
            
            if (node1 && node2) {
                totalDistance += calculateDistance(
                    node1.latitude, node1.longitude,
                    node2.latitude, node2.longitude
                );
            }
        }
        
        return totalDistance;
    }

    // Función para activar hospitales dentro del radio
    async function activateNearbyHospitals(centerLat, centerLon, radiusKm) {
        const nearbyHospitals = [];
        
        for (const hospital of HEALTH_FACILITIES) {
            const distance = calculateDistance(centerLat, centerLon, hospital.latitude, hospital.longitude);
            
            if (distance <= radiusKm) {
                // Buscar el nodo más cercano para este hospital
                const nearestNode = await getNearestNode(hospital.latitude, hospital.longitude);
                if (nearestNode) {
                    nearbyHospitals.push({
                        ...hospital,
                        activated: true,
                        node: nearestNode,
                        distance: distance
                    });
                }
            }
        }
        
        setActivatedHospitals(nearbyHospitals);
        
        // Limpiar distancias de rutas anteriores
        setHospitalRouteDistances({});
        
        if (nearbyHospitals.length > 0) {
            ui.current.showSnack(`${nearbyHospitals.length} hospital(es) activado(s) dentro del radio.`, "success");
        } else {
            ui.current.showSnack("No hay hospitales dentro del radio seleccionado.", "info");
        }
        
        return nearbyHospitals;
    }

    // Funciones para manejar hover
    function handleHospitalHover(info, event) {
        if (info.object) {
            setHoveredHospital(info.object);
            setMousePosition({ x: event.offsetX, y: event.offsetY });
        } else {
            setHoveredHospital(null);
        }
    }

    function handleMouseMove(event) {
        if (hoveredHospital) {
            setMousePosition({ x: event.offsetX, y: event.offsetY });
        }
    }

    async function mapClick(e, info, radius = null) {
        if(started && !animationEnded) return;

        setFadeRadiusReverse(false);
        fadeRadius.current = true;
        clearPath();

        // Solo permitir selección de punto de destino
        // if(e.layer?.id !== "selection-radius" && selectionRadius.length > 0) {
        //     ui.current.showSnack("Por favor selecciona un punto dentro del radio.", "info");
        //     return;
        // }

        if(loading) {
            ui.current.showSnack("Por favor espera a que carguen todos los datos.", "info");
            return;
        }

        const loadingHandle = setTimeout(() => {
            setLoading(true);
        }, 300);

        // Buscar nodo más cercano al punto clickeado
        const node = await getNearestNode(e.coordinate[1], e.coordinate[0]);
        if(!node) {
            ui.current.showSnack("No se encontró un camino en los alrededores, prueba otra ubicación.");
            clearTimeout(loadingHandle);
            setLoading(false);
            return;
        }

        // Establecer como punto de destino
        setEndNode(node);
        
        // Crear círculo de selección
        const radiusToUse = radius ?? settings.radius;
        const circle = createGeoJSONCircle([node.lon, node.lat], radiusToUse);
        setSelectionRadius([{ contour: circle}]);
        
        // Activar hospitales cercanos
        const nearbyHospitals = await activateNearbyHospitals(node.lat, node.lon, radiusToUse);
        
        // Cargar grafo si hay hospitales activados
        if (nearbyHospitals.length > 0) {
            getMapGraph(getBoundingBoxFromPolygon(circle), node.id).then(graph => {
                multiState.current.graph = graph;
                
                // Configurar nodo de destino en el estado
                const realEndNode = multiState.current.getNode(node.id);
                if (realEndNode) {
                    multiState.current.endNode = realEndNode;
                }
                
                clearTimeout(loadingHandle);
                setLoading(false);
            });
        } else {
            clearTimeout(loadingHandle);
            setLoading(false);
        }
    }

    // Iniciar pathfinding con hospitales activados
    function startPathfinding() {
        setFadeRadiusReverse(true);
        setTimeout(() => {
            clearPath();
            
            // Verificar que tenemos hospitales activados y punto de destino
            if (!multiState.current.graph || activatedHospitals.length === 0 || !endNode) {
                ui.current.showSnack("Por favor, selecciona un punto de destino para activar hospitales.", "error");
                setStarted(false);
                return;
            }
            
            // Configurar los nodos de inicio (hospitales) en el estado multi-source
            multiState.current.clearStartNodes();
            activatedHospitals.forEach(hospital => {
                const realStartNode = multiState.current.getNode(hospital.node.id);
                if (realStartNode) {
                    multiState.current.addStartNode(realStartNode);
                }
            });
            
            // Configurar nodo de destino
            const realEndNode = multiState.current.getNode(endNode.id);
            if (realEndNode) {
                multiState.current.endNode = realEndNode;
            }
            
            multiState.current.start(settings.algorithm);
            
            // Inicializar variables de trazado
            traceNodes.current = new Array(activatedHospitals.length).fill(null);
            optimalPathTracing.current = false;
            optimalPathNodes.current = [];
            
            setStarted(true);
        }, 400);
    }

    // Start or pause already running animation
    function toggleAnimation(loop = true, direction = 1) {
        if(time === 0 && !animationEnded) return;
        setPlaybackDirection(direction);
        if(animationEnded) {
            if(loop && time >= timer.current) {
                setTime(0);
            }
            setStarted(true);
            setPlaybackOn(!playbackOn);
            return;
        }
        setStarted(!started);
        if(started) {
            previousTimeRef.current = null;
        }
    }

    function clearPath() {
        setStarted(false);
        setTripsData([]);
        setTime(0);
        
        // Reset multi-source state
        if (multiState.current.graph) {
            multiState.current.reset();
        }
        
        // Reset multi-source specific variables
        optimalPathTracing.current = false;
        optimalPathNodes.current = [];
        traceNodes.current = new Array(activatedHospitals.length).fill(null);
        
        // Reset common variables
        waypoints.current = [];
        timer.current = 0;
        previousTimeRef.current = null;
        setAnimationEnded(false);
        
        // Limpiar distancias de rutas
        setHospitalRouteDistances({});
    }

    // Progress animation by one step - Solo modo multi-source
    function animateStep(newTime) {
        // Manejar múltiples algoritmos
        const allResults = multiState.current.nextStep();
        
        // Visualizar progreso de búsqueda con colores únicos
        for (const algorithmResult of allResults) {
            if (!algorithmResult.finished) {
                // Solo mostrar progreso para algoritmos que aún están buscando
                for (const nodeResult of algorithmResult.updatedNodes) {
                    if (nodeResult.node && nodeResult.node.referer) {
                        // Usar el color único del algoritmo para mostrar el progreso de búsqueda
                        updateWaypoints(nodeResult.node, nodeResult.node.referer, "path", 1, algorithmResult.color);
                    }
                }
            }
        }

        // Check if all algorithms have finished
        const allAlgorithmsFinished = multiState.current.finished;
        
        // Solo iniciar trazado de rutas óptimas cuando TODOS los algoritmos hayan terminado
        if (allAlgorithmsFinished && !optimalPathTracing.current) {
            // Calcular y almacenar las distancias de las rutas óptimas
            const optimalPaths = multiState.current.getAllOptimalPaths();
            const routeDistances = {};
            
            activatedHospitals.forEach((hospital, index) => {
                const path = optimalPaths[index];
                if (path && path.length > 1) {
                    const distance = calculateRouteDistance(path);
                    routeDistances[hospital.id] = distance;
                }
            });
            
            setHospitalRouteDistances(routeDistances);
            
            // Esperar un poco para que se complete la visualización de búsqueda
            setTimeout(() => {
                // Iniciar trazado de rutas óptimas en blanco
                optimalPathTracing.current = true;
                
                // Preparar nodos para trazado desde el final hacia cada inicio
                optimalPathNodes.current = optimalPaths.map(path => {
                    if (path && path.length > 1) {
                        return {
                            path: path,
                            currentIndex: path.length - 2, // Empezar desde el penúltimo nodo
                            finished: false
                        };
                    }
                    return { path: [], currentIndex: -1, finished: true };
                });
            }, 500); // Esperar 500ms para que se complete la búsqueda visual
        }

        // Trazar rutas óptimas en blanco SOLO después de que todos hayan terminado
        let optimalTracingActive = false;
        if (optimalPathTracing.current && optimalPathNodes.current.length > 0) {
            for (let i = 0; i < optimalPathNodes.current.length; i++) {
                const pathTracer = optimalPathNodes.current[i];
                
                if (!pathTracer.finished && pathTracer.currentIndex >= 0) {
                    // Trazar múltiples segmentos por frame para velocidad alta
                    const segmentsPerFrame = Math.max(3, Math.floor(settings.speed / 2)); // Mínimo 3, escalable con velocidad
                    
                    for (let segment = 0; segment < segmentsPerFrame && pathTracer.currentIndex >= 0 && !pathTracer.finished; segment++) {
                        const currentNodeId = pathTracer.path[pathTracer.currentIndex];
                        const nextNodeId = pathTracer.path[pathTracer.currentIndex + 1];
                        
                        const currentNode = multiState.current.getNode(currentNodeId);
                        const nextNode = multiState.current.getNode(nextNodeId);
                        
                        if (currentNode && nextNode) {
                            // Trazar en blanco desde el destino hacia el inicio con timeMultiplier muy pequeño para velocidad máxima
                            updateWaypoints(currentNode, nextNode, "route", 0.1, [255, 255, 255]); // Blanco, velocidad alta
                            pathTracer.currentIndex--;
                            optimalTracingActive = true;
                        }
                        
                        if (pathTracer.currentIndex < 0) {
                            pathTracer.finished = true;
                            break;
                        }
                    }
                }
            }
        }

        // Verificar si todo el trazado ha terminado
        const allOptimalPathsTraced = !optimalPathTracing.current || 
            (optimalPathNodes.current.length > 0 && optimalPathNodes.current.every(tracer => tracer.finished));
        
        // Terminamos cuando todos los algoritmos han acabado y todas las rutas óptimas están trazadas
        setAnimationEnded(time >= timer.current && allAlgorithmsFinished && allOptimalPathsTraced && !optimalTracingActive);

        // Animation progress
        if (previousTimeRef.current != null && !animationEnded) {
            const deltaTime = newTime - previousTimeRef.current;
            setTime(prevTime => (prevTime + deltaTime * playbackDirection));
        }

        // Playback progress
        if(previousTimeRef.current != null && animationEnded && playbackOn) {
            const deltaTime = newTime - previousTimeRef.current;
            if(time >= timer.current && playbackDirection !== -1) {
                setPlaybackOn(false);
            }
            setTime(prevTime => (Math.max(Math.min(prevTime + deltaTime * 2 * playbackDirection, timer.current), 0)));
        }
    }

    // Animation callback
    function animate(newTime) {
        for(let i = 0; i < settings.speed; i++) {
            animateStep(newTime);
        }

        previousTimeRef.current = newTime;
        requestRef.current = requestAnimationFrame(animate);
    }

    // Add new node to the waypoints property and increment timer
    function updateWaypoints(node, refererNode, colorType = "path", timeMultiplier = 1, customColor = null) {
        if(!node || !refererNode) return;
        const distance = Math.hypot(node.longitude - refererNode.longitude, node.latitude - refererNode.latitude);
        const timeAdd = distance * 50000 * timeMultiplier;

        // Use custom color if provided, otherwise use the color type
        const finalColor = customColor || colorType;

        waypoints.current = [...waypoints.current,
            { 
                path: [[refererNode.longitude, refererNode.latitude], [node.longitude, node.latitude]],
                timestamps: [timer.current, timer.current + timeAdd],
                color: finalColor,
                customColor: customColor !== null // Flag to indicate if using custom color
            }
        ];

        timer.current += timeAdd;
        setTripsData(() => waypoints.current);
    }

    function changeSettings(newSettings) {
        setSettings(newSettings);
        const items = { settings: newSettings, colors };
        localStorage.setItem("path_settings", JSON.stringify(items));
    }

    function changeColors(newColors) {
        setColors(newColors);
        const items = { settings, colors: newColors };
        localStorage.setItem("path_settings", JSON.stringify(items));
    }

    function changeAlgorithm(algorithm) {
        clearPath();
        changeSettings({ ...settings, algorithm });
    }

    function changeRadius(radius) {
        changeSettings({...settings, radius});
        if(endNode) {
            mapClick({coordinate: [endNode.lon, endNode.lat]}, {}, radius);
        }
    }

    function changeLocation(coords) {
        setViewState({
            ...viewState,
            longitude: coords.longitude,
            latitude: coords.latitude,
            zoom: 12,
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator()
        });
    }

    useEffect(() => {
        if(!started) return;
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [started, time, animationEnded, playbackOn]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(res => {
            changeLocation(res.coords);
        });

        const settings = localStorage.getItem("path_settings");
        if(!settings) return;
        const items = JSON.parse(settings);

        setSettings(items.settings);
        setColors(items.colors);
    }, []);

    return (
        <>
            <div 
                onContextMenu={(e) => { e.preventDefault(); }}
                onMouseMove={handleMouseMove}
                style={{ position: 'relative' }}
            >
                <DeckGL
                    initialViewState={viewState}
                    controller={{ doubleClickZoom: false, keyboard: false }}
                    onClick={mapClick}
                >
                    <PolygonLayer 
                        id={"selection-radius"}
                        data={selectionRadius}
                        pickable={true}
                        stroked={true}
                        getPolygon={d => d.contour}
                        getFillColor={[80, 210, 0, 10]}
                        getLineColor={[9, 142, 46, 175]}
                        getLineWidth={3}
                        opacity={selectionRadiusOpacity}
                    />
                    <TripsLayer
                        id={"pathfinding-layer"}
                        data={tripsData}
                        opacity={1}
                        widthMinPixels={3}
                        widthMaxPixels={5}
                        fadeTrail={false}
                        currentTime={time}
                        getColor={d => {
                            // Use custom color if available, otherwise use predefined colors
                            if (d.customColor) {
                                return d.color;
                            }
                            return colors[d.color] || d.color;
                        }}
                        updateTriggers={{
                            getColor: [colors.path, colors.route, tripsData]
                        }}
                    />
                    <ScatterplotLayer 
                        id="start-end-points"
                        data={[
                            // Hospitales activados
                            ...activatedHospitals.map((hospital, index) => ({
                                coordinates: [hospital.longitude, hospital.latitude],
                                color: multiState.current.colors[index] 
                                    ? multiState.current.colors[index] 
                                    : colors.startNodeFill,
                                lineColor: colors.startNodeBorder,
                                isStart: true,
                                index: index,
                                name: hospital.name,
                                type: hospital.type,
                                isActivated: true,
                                hospitalId: hospital.id,
                                routeDistance: hospitalRouteDistances[hospital.id]
                            })),
                            // Todos los hospitales (no activados) en gris
                            ...HEALTH_FACILITIES.filter(hospital => 
                                !activatedHospitals.find(activated => activated.id === hospital.id)
                            ).map(hospital => ({
                                coordinates: [hospital.longitude, hospital.latitude],
                                color: [128, 128, 128], // Gris para hospitales no activados
                                lineColor: [64, 64, 64],
                                isStart: false,
                                name: hospital.name,
                                type: hospital.type,
                                isActivated: false,
                                hospitalId: hospital.id,
                                routeDistance: null
                            })),
                            // Nodo de destino
                            ...(endNode ? [{ 
                                coordinates: [endNode.lon, endNode.lat], 
                                color: colors.endNodeFill, 
                                lineColor: colors.endNodeBorder,
                                isStart: false,
                                name: "Punto de Destino",
                                type: "destino",
                                isActivated: false,
                                hospitalId: null,
                                routeDistance: null
                            }] : []),
                        ]}
                        pickable={true}
                        opacity={1}
                        stroked={true}
                        filled={true}
                        radiusScale={1}
                        radiusMinPixels={8}
                        radiusMaxPixels={25}
                        lineWidthMinPixels={1}
                        lineWidthMaxPixels={3}
                        getPosition={d => d.coordinates}
                        getFillColor={d => d.color}
                        getLineColor={d => d.lineColor}
                        onHover={handleHospitalHover}
                        updateTriggers={{
                            getFillColor: [activatedHospitals, colors, multiState.current?.colors],
                            data: [activatedHospitals, hospitalRouteDistances, endNode]
                        }}
                    />
                    <MapGL 
                        reuseMaps mapLib={maplibregl} 
                        mapStyle={MAP_STYLE} 
                        doubleClickZoom={false}
                    />
                </DeckGL>
                
                {/* Tooltip */}
                {hoveredHospital && (
                    <div
                        style={{
                            position: 'absolute',
                            left: mousePosition.x + 10,
                            top: mousePosition.y - 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            color: 'white',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            pointerEvents: 'none',
                            zIndex: 1000,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            maxWidth: '280px',
                            minWidth: '200px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '14px' }}>
                            {hoveredHospital.name}
                        </div>
                        <div style={{ 
                            fontSize: '12px', 
                            color: hoveredHospital.isActivated ? '#4ade80' : '#9ca3af',
                            textTransform: 'capitalize',
                            marginBottom: '4px'
                        }}>
                            {hoveredHospital.type} {hoveredHospital.isActivated ? '(Activado)' : ''}
                        </div>
                        {hoveredHospital.isActivated && hoveredHospital.routeDistance !== null && hoveredHospital.routeDistance !== undefined && (
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#60a5fa',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                paddingTop: '4px',
                                marginTop: '4px'
                            }}>
                                🛣️ Distancia de ruta: <strong>{hoveredHospital.routeDistance.toFixed(2)} km</strong>
                            </div>
                        )}
                        {hoveredHospital.isActivated && (hoveredHospital.routeDistance === null || hoveredHospital.routeDistance === undefined) && (
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#fbbf24',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                paddingTop: '4px',
                                marginTop: '4px'
                            }}>
                                🔄 Ejecuta el algoritmo para ver la distancia
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Interface 
                ref={ui}
                canStart={activatedHospitals.length > 0 && endNode}
                started={started}
                animationEnded={animationEnded}
                playbackOn={playbackOn}
                time={time}
                startPathfinding={startPathfinding}
                toggleAnimation={toggleAnimation}
                clearPath={clearPath}
                timeChanged={setTime}
                maxTime={timer.current}
                settings={settings}
                setSettings={changeSettings}
                changeAlgorithm={changeAlgorithm}
                colors={colors}
                setColors={changeColors}
                loading={loading}
                activatedHospitals={activatedHospitals}
                endNode={endNode}
                changeRadius={changeRadius}
            />
        </>
    );
}

export default Map;