export const MAP_STYLE = "./map_style.json";

export const INITIAL_VIEW_STATE = {
  longitude: -77.0428, // Centrado en Lima
  latitude: -12.0464,  // Centrado en Lima
  zoom: 11,
  pitch: 0,
  bearing: 0
};

export const INITIAL_COLORS = {
    startNodeFill: [70, 183, 128],
    startNodeBorder: [255, 255, 255],
    endNodeFill: [152, 4, 12],
    endNodeBorder: [0, 0, 0],
    path: [70, 183, 128],
    route: [165, 13, 32],
};

// Colores predefinidos para múltiples rutas
export const MULTI_SOURCE_COLORS = [
    [70, 183, 128],   // Verde
    [152, 4, 12],     // Rojo
    [0, 123, 255],    // Azul
    [255, 193, 7],    // Amarillo
    [108, 117, 125],  // Gris
    [220, 53, 69],    // Rojo claro
    [40, 167, 69],    // Verde claro
    [253, 126, 20],   // Naranja
    [111, 66, 193],   // Morado
    [23, 162, 184],   // Cian
    [255, 105, 180],  // Rosa
    [144, 238, 144],  // Verde claro pastel
    [255, 165, 0],    // Naranja oscuro
    [138, 43, 226],   // Violeta
    [30, 144, 255],   // Azul dodger
];

export const HEALTH_FACILITIES = [
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