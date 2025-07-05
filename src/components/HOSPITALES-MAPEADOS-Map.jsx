/*Map.jsx - Optimizado con nodos precalculados*/
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
import { INITIAL_COLORS, INITIAL_VIEW_STATE, MAP_STYLE } from "../config";
import useSmoothStateChange from "../hooks/useSmoothStateChange";

// Lista de hospitales con nodos precalculados
// IMPORTANTE: Reemplaza esta lista con el resultado del script de precálculo
const HEALTH_FACILITIES = [
  {
    "id": "hosp1",
    "name": "Hospital Nacional Dos De Mayo",
    "longitude": -77.01461873374852,
    "latitude": -12.056258406493845,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 5487373126,
    "nearestNodeLat": -12.0564312,
    "nearestNodeLon": -77.0147157
  },
  {
    "id": "hosp2",
    "name": "Hospital Arzobispo Loayza",
    "longitude": -77.0445661439587,
    "latitude": -12.048339681656948,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 10588181631,
    "nearestNodeLat": -12.0483132,
    "nearestNodeLon": -77.0445961
  },
  {
    "id": "hosp3",
    "name": "Hospital EsSalud Angamos",
    "longitude": -77.02805791633861,
    "latitude": -12.11361251073139,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 5481227475,
    "nearestNodeLat": -12.1135903,
    "nearestNodeLon": -77.0281011
  },
  {
    "id": "hosp4",
    "name": "Hospital Santa Rosa",
    "longitude": -77.06151026922002,
    "latitude": -12.071818994736823,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 4143760938,
    "nearestNodeLat": -12.0717159,
    "nearestNodeLon": -77.0615311
  },
  {
    "id": "hosp5",
    "name": "Hospital de Emergencias Casimiro Ulloa",
    "longitude": -77.01803399279487,
    "latitude": -12.128113054055287,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 263635944,
    "nearestNodeLat": -12.128576,
    "nearestNodeLon": -77.0180559
  },
  {
    "id": "hosp6",
    "name": "Hospital Nacional Sergio E. Bernales",
    "longitude": -77.03891071090206,
    "latitude": -11.912712007917936,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 5661537194,
    "nearestNodeLat": -11.9126991,
    "nearestNodeLon": -77.0389002
  },
  {
    "id": "hosp7",
    "name": "Hospital Nacional Cayetano Heredia",
    "longitude": -77.05507342249902,
    "latitude": -12.02274524059977,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 11201081561,
    "nearestNodeLat": -12.0226316,
    "nearestNodeLon": -77.054931
  },
  {
    "id": "hosp8",
    "name": "Hospital María Auxiliadora",
    "longitude": -76.95907157072388,
    "latitude": -12.160562687428335,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 11218904295,
    "nearestNodeLat": -12.1604412,
    "nearestNodeLon": -76.959014
  },
  {
    "id": "hosp9",
    "name": "Hospital Nacional Hipolito Unánue",
    "longitude": -76.99330947922503,
    "latitude": -12.039961351504228,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 1273751347,
    "nearestNodeLat": -12.0399601,
    "nearestNodeLon": -76.993339
  },
  {
    "id": "hosp10",
    "name": "Hospital Hermilio Valdizán",
    "longitude": -76.94564061174229,
    "latitude": -12.046801020075112,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 5711943173,
    "nearestNodeLat": -12.0468424,
    "nearestNodeLon": -76.9457034
  },
  {
    "id": "hosp11",
    "name": "Hospital de Vitarte",
    "longitude": -76.9200770454144,
    "latitude": -12.026166246008126,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 4376589164,
    "nearestNodeLat": -12.0261825,
    "nearestNodeLon": -76.9201614
  },
  {
    "id": "hosp12",
    "name": "Hospital Nacional San Juan de Lurigancho",
    "longitude": -77.00308968594325,
    "latitude": -11.96664922748575,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 9948737165,
    "nearestNodeLat": -11.9666479,
    "nearestNodeLon": -77.0031379
  },
  {
    "id": "hosp13",
    "name": "Hospital de Emergencias Villa El Salvador",
    "longitude": -76.93403314341495,
    "latitude": -12.233138385215074,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 8381503351,
    "nearestNodeLat": -12.2331182,
    "nearestNodeLon": -76.9340451
  },
  {
    "id": "hosp14",
    "name": "Hospital Nacional Daniel Alcides Carrión",
    "longitude": -77.12337721284975,
    "latitude": -12.062459062154812,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 1843191313,
    "nearestNodeLat": -12.0624023,
    "nearestNodeLon": -77.1234214
  },
  {
    "id": "hosp15",
    "name": "Hospital de Ventanilla",
    "longitude": -77.12548761622809,
    "latitude": -11.872975978739923,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 10748670609,
    "nearestNodeLat": -11.8730005,
    "nearestNodeLon": -77.1255135
  },
  {
    "id": "hosp16",
    "name": "Hospital San Jose Callao",
    "longitude": -77.09887180768905,
    "latitude": -12.042701541196195,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 9196805615,
    "nearestNodeLat": -12.0426531,
    "nearestNodeLon": -77.0984585
  },
  {
    "id": "hosp17",
    "name": "Hospital Alberto Sabogal Sologuren",
    "longitude": -77.12328233315031,
    "latitude": -12.064870714035564,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 10702745895,
    "nearestNodeLat": -12.0648401,
    "nearestNodeLon": -77.1233095
  },
  {
    "id": "hosp18",
    "name": "Hospital Edgardo Rebagliati Martins",
    "longitude": -77.0387573428198,
    "latitude": -12.080060687757808,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 12458030287,
    "nearestNodeLat": -12.080051,
    "nearestNodeLon": -77.0386949
  },
  {
    "id": "hosp19",
    "name": "Hospital Nacional Guillermo Almenara Irigoyen",
    "longitude": -77.02313000403944,
    "latitude": -12.059157792033176,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 8761430660,
    "nearestNodeLat": -12.0591487,
    "nearestNodeLon": -77.0231622
  },
  {
    "id": "hosp20",
    "name": "Hospital de Emergencias Grau",
    "longitude": -77.03098248664344,
    "latitude": -12.059068803196865,
    "type": "hospital",
    "activated": false,
    "nearestNodeId": 4560651789,
    "nearestNodeLat": -12.0591706,
    "nearestNodeLon": -77.0310944
  },
  {
    "id": "cs1",
    "name": "Centro de Emergencias San Pedro de los Chorrillos",
    "longitude": -77.0236307021554,
    "latitude": -12.166459745692864,
    "type": "I-4",
    "activated": false,
    "nearestNodeId": 7711789560,
    "nearestNodeLat": -12.1664074,
    "nearestNodeLon": -77.0235877
  },
  {
    "id": "cs2",
    "name": "C.S.M.I. Dr. Enrique Martin Altuna ",
    "longitude": -77.10880789564922,
    "latitude": -11.837588368064761,
    "type": "I-4",
    "activated": false,
    "nearestNodeId": 1759542281,
    "nearestNodeLat": -11.8373371,
    "nearestNodeLon": -77.1091195
  },
  {
    "id": "cs3",
    "name": "Centro de Salud Mexico",
    "longitude": -77.08589205741765,
    "latitude": -12.024903805405666,
    "type": "I-4",
    "activated": false,
    "nearestNodeId": 599287873,
    "nearestNodeLat": -12.0248891,
    "nearestNodeLon": -77.0859061
  },
  {
    "id": "cs4",
    "name": "Centro de Salud Materno Infantil El Porvenir",
    "longitude": -77.02088523442151,
    "latitude": -12.067658968907425,
    "type": "I-4",
    "activated": false,
    "nearestNodeId": 11839779613,
    "nearestNodeLat": -12.0678035,
    "nearestNodeLon": -77.0206536
  },
  {
    "id": "cs5",
    "name": "Centro Materno Infantil Daniel Alcides Carrión",
    "longitude": -76.94538399744961,
    "latitude": -12.17778919254979,
    "type": "I-4",
    "activated": false,
    "nearestNodeId": 5316560589,
    "nearestNodeLat": -12.1774791,
    "nearestNodeLon": -76.9454099
  },
  {
    "id": "cs6",
    "name": "Centro Materno Infantil Manuel Barreto",
    "longitude": -76.96859019709719,
    "latitude": -12.152257020932733,
    "type": "I-4",
    "activated": false,
    "nearestNodeId": 1796866442,
    "nearestNodeLat": -12.1522946,
    "nearestNodeLon": -76.9683996
  },
  {
    "id": "cs7",
    "name": "Centro de Salud Breña",
    "longitude": -77.05798563569698,
    "latitude": -12.063930246247862,
    "type": "I-3",
    "activated": false,
    "nearestNodeId": 1273527183,
    "nearestNodeLat": -12.0639769,
    "nearestNodeLon": -77.0579848
  },
  {
    "id": "cs8",
    "name": "Centro de Salud San Juan de Miraflores",
    "longitude": -76.9750951661881,
    "latitude": -12.157920164785214,
    "type": "I-3",
    "activated": false,
    "nearestNodeId": 1752594986,
    "nearestNodeLat": -12.1582901,
    "nearestNodeLon": -76.9751611
  },
  {
    "id": "cs9",
    "name": "Centro de Salud San Miguel",
    "longitude": -77.0987104227323,
    "latitude": -12.081391316462103,
    "type": "I-3",
    "activated": false,
    "nearestNodeId": 608345636,
    "nearestNodeLat": -12.0811894,
    "nearestNodeLon": -77.0985912
  },
  {
    "id": "cs10",
    "name": "Centro de Salud San Sebastián",
    "longitude": -77.13034088722787,
    "latitude": -12.068505210473884,
    "type": "I-3",
    "activated": false,
    "nearestNodeId": 12505658675,
    "nearestNodeLat": -12.0685313,
    "nearestNodeLon": -77.1303364
  },
  {
    "id": "cs11",
    "name": "Centro de Salud San Juan de Salinas",
    "longitude": -77.08532160978176,
    "latitude": -11.984167282753823,
    "type": "I-3",
    "activated": false,
    "nearestNodeId": 675127437,
    "nearestNodeLat": -11.9844165,
    "nearestNodeLon": -77.08533
  },
  {
    "id": "cs12",
    "name": "Centro de Salud Santiago de Surco",
    "longitude": -77.00614461366816,
    "latitude": -12.147301939265757,
    "type": "I-3",
    "activated": false,
    "nearestNodeId": 1273809579,
    "nearestNodeLat": -12.147409,
    "nearestNodeLon": -77.006215
  },
  {
    "id": "cs13",
    "name": "Centro de Salud San Juan de Amancaes",
    "longitude": -77.02678055678233,
    "latitude": -12.016397621847046,
    "type": "I-3",
    "activated": false,
    "nearestNodeId": 1324511787,
    "nearestNodeLat": -12.0164583,
    "nearestNodeLon": -77.0268604
  },
  {
    "id": "cs14",
    "name": "Centro de Salud Tupac Amaru de Villa",
    "longitude": -76.98192213332074,
    "latitude": -12.193615002749665,
    "type": "I-3",
    "activated": false,
    "nearestNodeId": 4356786035,
    "nearestNodeLat": -12.1934769,
    "nearestNodeLon": -76.9818136
  },
  {
    "id": "cs15",
    "name": "Puesto de Salud Jose Olaya",
    "longitude": -77.03907917490714,
    "latitude": -11.96746027706088,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 1331962069,
    "nearestNodeLat": -11.9674495,
    "nearestNodeLon": -77.0390421
  },
  {
    "id": "cs16",
    "name": "Puesto de Salud San Roque",
    "longitude": -76.98883522923848,
    "latitude": -12.149179862633215,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 2761780925,
    "nearestNodeLat": -12.1491406,
    "nearestNodeLon": -76.9888255
  },
  {
    "id": "cs17",
    "name": "CS Virgen del Rosario Carapongo ",
    "longitude": -76.87570747956417,
    "latitude": -12.002153850036082,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 1744675966,
    "nearestNodeLat": -12.0021172,
    "nearestNodeLon": -76.8755921
  },
  {
    "id": "cs18",
    "name": "Puesto de Salud Nueva Esperanza Alta ",
    "longitude": -76.93655297704846,
    "latitude": -12.179280351173384,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 5721442476,
    "nearestNodeLat": -12.179372,
    "nearestNodeLon": -76.9365953
  },
  {
    "id": "cs19",
    "name": "Puesto de Salud César Vallejo ",
    "longitude": -76.93706384417936,
    "latitude": -12.187241472425736,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 1273675368,
    "nearestNodeLat": -12.1873101,
    "nearestNodeLon": -76.9371542
  },
  {
    "id": "cs20",
    "name": "Puesto de salud David Tejada de Rivero",
    "longitude": -77.10140707056588,
    "latitude": -11.983991925575873,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 5746004215,
    "nearestNodeLat": -11.9840228,
    "nearestNodeLon": -77.1014501
  },
  {
    "id": "cs21",
    "name": "Puesto de Salud 5 de Mayo ",
    "longitude": -76.96255219765128,
    "latitude": -12.132306291218462,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 1273792874,
    "nearestNodeLat": -12.1324644,
    "nearestNodeLon": -76.9623974
  },
  {
    "id": "cs22",
    "name": "Puesto de Salud San Francisco de La Cruz ",
    "longitude": -76.96347929683722,
    "latitude": -12.151716293536115,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 1273878861,
    "nearestNodeLat": -12.151677,
    "nearestNodeLon": -76.9634167
  },
  {
    "id": "cs23",
    "name": "Puesto de Salud Cerro Candela ",
    "longitude": -77.10716501662287,
    "latitude": -11.971659113628027,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 4270454131,
    "nearestNodeLat": -11.97166,
    "nearestNodeLon": -77.1072254
  },
  {
    "id": "cs24",
    "name": "Puesto de Salud Valle de Sarón ",
    "longitude": -76.96617743659255,
    "latitude": -12.17110733921245,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 1273690643,
    "nearestNodeLat": -12.1711143,
    "nearestNodeLon": -76.96608
  },
  {
    "id": "cs25",
    "name": "Puesto de Salud José María Arguedas ",
    "longitude": -76.95556689715677,
    "latitude": -12.132584637364149,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 1273854935,
    "nearestNodeLat": -12.1327403,
    "nearestNodeLon": -76.9556403
  },
  {
    "id": "cs26",
    "name": "Puesto de Salud 12 de Junio ",
    "longitude": -76.92967779771037,
    "latitude": -12.163262076391867,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 4497359240,
    "nearestNodeLat": -12.1632776,
    "nearestNodeLon": -76.929716
  },
  {
    "id": "cs27",
    "name": "Puesto de Salud Villa Venturo ",
    "longitude": -77.0126692701776,
    "latitude": -12.187541436642757,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 2132998808,
    "nearestNodeLat": -12.1875331,
    "nearestNodeLon": -77.0126436
  },
  {
    "id": "cs28",
    "name": "Puesto de Salud Vista Alegre de Villa",
    "longitude": -76.99259410468467,
    "latitude": -12.187158593996005,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 1827925772,
    "nearestNodeLat": -12.1871524,
    "nearestNodeLon": -76.9927079
  },
  {
    "id": "cs29",
    "name": "Puesto de Salud Sagrada Familia",
    "longitude": -76.94375167648148,
    "latitude": -12.209242704123776,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 1273974701,
    "nearestNodeLat": -12.2091493,
    "nearestNodeLon": -76.9436181
  },
  {
    "id": "cs30",
    "name": "Puesto de Salud Llanavilla",
    "longitude": -76.94181958921094,
    "latitude": -12.191241376806738,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 4367063646,
    "nearestNodeLat": -12.1912338,
    "nearestNodeLon": -76.941779
  },
  {
    "id": "cs31",
    "name": "Puesto de Salud Virgen de las Mercedes",
    "longitude": -77.15699697257776,
    "latitude": -11.784963415771623,
    "type": "I-2",
    "activated": false,
    "nearestNodeId": 5066864131,
    "nearestNodeLat": -11.784972,
    "nearestNodeLon": -77.1569654
  },
  {
    "id": "cs32",
    "name": "Puesto de Salud Tambo Inga",
    "longitude": -76.8411917706252,
    "latitude": -12.147383184099848,
    "type": "I-1",
    "activated": false,
    "nearestNodeId": 3719054218,
    "nearestNodeLat": -12.1475806,
    "nearestNodeLon": -76.8410904
  },
  {
    "id": "cs33",
    "name": "Puesto de Salud San Carlos",
    "longitude": -77.0413745812935,
    "latitude": -11.908618969744396,
    "type": "I-1",
    "activated": false,
    "nearestNodeId": 10753772732,
    "nearestNodeLat": -11.9086025,
    "nearestNodeLon": -77.0414029
  }
];

function Map() {
    const [activatedHospitals, setActivatedHospitals] = useState([]); // Hospitales activados
    const [endNode, setEndNode] = useState(null);
    const [selectionRadius, setSelectionRadius] = useState([]);
    const [tripsData, setTripsData] = useState([]);
    const [started, setStarted] = useState();
    const [time, setTime] = useState(0);
    const [animationEnded, setAnimationEnded] = useState(false);
    const [playbackOn, setPlaybackOn] = useState(false);
    const [playbackDirection, setPlaybackDirection] = useState(1);
    const [fadeRadiusReverse, setFadeRadiusReverse] = useState(false);

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

    // Función optimizada para activar hospitales dentro del radio (SIN llamadas API)
    function activateNearbyHospitals(centerLat, centerLon, radiusKm) {
        const nearbyHospitals = [];
        
        for (const hospital of HEALTH_FACILITIES) {
            // Filtrar solo hospitales que tienen nodo precalculado
            if (!hospital.nearestNodeId) {
                console.warn(`Hospital ${hospital.name} no tiene nodo precalculado`);
                continue;
            }
            
            const distance = calculateDistance(centerLat, centerLon, hospital.latitude, hospital.longitude);
            
            if (distance <= radiusKm) {
                // Usar el nodo precalculado (SIN llamada API)
                const precomputedNode = {
                    id: hospital.nearestNodeId,
                    lat: hospital.nearestNodeLat,
                    lon: hospital.nearestNodeLon
                };
                
                nearbyHospitals.push({
                    ...hospital,
                    activated: true,
                    node: precomputedNode,
                    distance: distance
                });
            }
        }
        
        setActivatedHospitals(nearbyHospitals);
        
        if (nearbyHospitals.length > 0) {
            ui.current.showSnack(`${nearbyHospitals.length} hospital(es) activado(s) dentro del radio.`, "success");
        } else {
            ui.current.showSnack("No hay hospitales dentro del radio seleccionado.", "info");
        }
        
        return nearbyHospitals;
    }

    async function mapClick(e, info, radius = null) {
        if(started && !animationEnded) return;

        setFadeRadiusReverse(false);
        fadeRadius.current = true;
        clearPath();

        // Solo permitir selección de punto de destino
        if(e.layer?.id !== "selection-radius" && selectionRadius.length > 0) {
            ui.current.showSnack("Por favor selecciona un punto dentro del radio.", "info");
            return;
        }

        if(loading) {
            ui.current.showSnack("Por favor espera a que carguen todos los datos.", "info");
            return;
        }

        const loadingHandle = setTimeout(() => {
            setLoading(true);
        }, 300);

        try {
            // ÚNICA llamada API necesaria: solo para el punto de destino
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
            
            // Activar hospitales cercanos (SIN llamadas API adicionales)
            const nearbyHospitals = activateNearbyHospitals(node.lat, node.lon, radiusToUse);
            
            // Cargar grafo si hay hospitales activados
            if (nearbyHospitals.length > 0) {
                const graph = await getMapGraph(getBoundingBoxFromPolygon(circle), node.id);
                multiState.current.graph = graph;
                
                // Configurar nodo de destino en el estado
                const realEndNode = multiState.current.getNode(node.id);
                if (realEndNode) {
                    multiState.current.endNode = realEndNode;
                }
            }
        } catch (error) {
            console.error('Error en mapClick:', error);
            ui.current.showSnack("Error al procesar la selección. Inténtalo de nuevo.", "error");
        } finally {
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
                } else {
                    console.warn(`No se encontró el nodo ${hospital.node.id} para el hospital ${hospital.name}`);
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
            // Esperar un poco para que se complete la visualización de búsqueda
            setTimeout(() => {
                // Iniciar trazado de rutas óptimas en blanco
                optimalPathTracing.current = true;
                const optimalPaths = multiState.current.getAllOptimalPaths();
                
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
            <div onContextMenu={(e) => { e.preventDefault(); }}>
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
                                name: hospital.name
                            })),
                            // Todos los hospitales (no activados) en gris
                            ...HEALTH_FACILITIES.filter(hospital => 
                                !activatedHospitals.find(activated => activated.id === hospital.id)
                            ).map(hospital => ({
                                coordinates: [hospital.longitude, hospital.latitude],
                                color: [128, 128, 128], // Gris para hospitales no activados
                                lineColor: [64, 64, 64],
                                isStart: false,
                                name: hospital.name
                            })),
                            // Nodo de destino
                            ...(endNode ? [{ 
                                coordinates: [endNode.lon, endNode.lat], 
                                color: colors.endNodeFill, 
                                lineColor: colors.endNodeBorder,
                                isStart: false 
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
                        updateTriggers={{
                            getFillColor: [activatedHospitals, colors, multiState.current?.colors]
                        }}
                    />
                    <MapGL 
                        reuseMaps mapLib={maplibregl} 
                        mapStyle={MAP_STYLE} 
                        doubleClickZoom={false}
                    />
                </DeckGL>
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
            <div className="attrib-container"><summary className="maplibregl-ctrl-attrib-button" title="Toggle attribution" aria-label="Toggle attribution"></summary><div className="maplibregl-ctrl-attrib-inner">© <a href="https://carto.com/about-carto/" target="_blank" rel="noopener">CARTO</a>, © <a href="http://www.openstreetmap.org/about/" target="_blank">OpenStreetMap</a> contributors</div></div>
        </>
    );
}

export default Map;