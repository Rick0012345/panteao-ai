import React, { useState, useEffect, useRef } from 'react';
import '../styles/Graph.css';

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
}

interface GraphProps {
  onPathFound: (path: string[], distance: number) => void;
}

const Graph: React.FC<GraphProps> = ({ onPathFound }) => {
  const [nodes] = useState<Node[]>([
    { id: 'afrodite', name: 'Afrodite', x: 400, y: 100 },
    { id: 'zeus', name: 'Zeus', x: 400, y: 300 },
    { id: 'atena', name: 'Atena', x: 200, y: 300 },
    { id: 'hefesto', name: 'Hefesto', x: 600, y: 300 },
    { id: 'hermes', name: 'Hermes', x: 400, y: 500 }
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { source: 'afrodite', target: 'zeus', weight: 10 },
    { source: 'afrodite', target: 'atena', weight: 150 },
    { source: 'afrodite', target: 'hefesto', weight: 120 },
    { source: 'zeus', target: 'atena', weight: 320 },
    { source: 'zeus', target: 'hefesto', weight: 70 },
    { source: 'zeus', target: 'hermes', weight: 180 },
    { source: 'atena', target: 'hermes', weight: 200 },
    { source: 'hefesto', target: 'hermes', weight: 250 }
  ]);

  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  const [path, setPath] = useState<string[]>([]);
  const [animationPath, setAnimationPath] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState<number>(0);

  // Limpa a animação quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Efeito para animar o caminho quando o path muda
  useEffect(() => {
    if (path.length > 0 && !isAnimating) {
      startAnimation();
    }
  }, [path]);

  const generateRandomWeights = () => {
    const newEdges = edges.map(edge => ({
      ...edge,
      weight: Math.floor(Math.random() * 300) + 10 // Pesos entre 10 e 309
    }));
    setEdges(newEdges);
    // Limpa o caminho atual quando os pesos são alterados
    setPath([]);
    setAnimationPath([]);
    setAnimationProgress(0);
  };

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationPath([]);
    setAnimationProgress(0);
    
    let step = 0;
    const totalSteps = path.length;
    const animationDuration = 2000; // 2 segundos para a animação completa
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / animationDuration, 1);
      setAnimationProgress(progress);
      
      const currentStep = Math.min(Math.floor(progress * totalSteps), totalSteps);
      
      if (currentStep > step) {
        step = currentStep;
        setAnimationPath(path.slice(0, step + 1));
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimationPath(path);
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const findShortestPath = () => {
    if (!startNode || !endNode) {
      alert('Por favor, selecione os pontos de origem e destino.');
      return;
    }

    // Limpa qualquer animação anterior
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
    }

    // Implementação do algoritmo de Dijkstra
    const graph: Record<string, Record<string, number>> = {};
    
    // Inicializa o grafo
    nodes.forEach(node => {
      graph[node.id] = {};
    });
    
    // Preenche o grafo com as arestas
    edges.forEach(edge => {
      graph[edge.source][edge.target] = edge.weight;
      graph[edge.target][edge.source] = edge.weight; // Grafo não direcionado
    });
    
    // Inicializa as distâncias e o conjunto de nós não visitados
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const unvisited = new Set<string>();
    
    nodes.forEach(node => {
      distances[node.id] = node.id === startNode ? 0 : Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });
    
    // Algoritmo de Dijkstra
    while (unvisited.size > 0) {
      // Encontra o nó não visitado com a menor distância
      let current: string | null = null;
      let minDistance = Infinity;
      
      unvisited.forEach(nodeId => {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          current = nodeId;
        }
      });
      
      if (current === null) break;
      if (current === endNode) break;
      
      unvisited.delete(current);
      
      // Atualiza as distâncias dos vizinhos
      const currentNode = current; // Cria uma variável não-nula para usar dentro do loop
      Object.entries(graph[currentNode]).forEach(([neighbor, weight]) => {
        if (unvisited.has(neighbor)) {
          const distance = distances[currentNode] + weight;
          if (distance < distances[neighbor]) {
            distances[neighbor] = distance;
            previous[neighbor] = currentNode;
          }
        }
      });
    }
    
    // Reconstrói o caminho
    const newPath: string[] = [];
    let current = endNode;
    
    while (current) {
      newPath.unshift(current);
      current = previous[current] || '';
      if (!current) break;
    }
    
    if (newPath[0] !== startNode) {
      alert('Não foi possível encontrar um caminho entre os pontos selecionados.');
      return;
    }
    
    // Define o novo caminho e inicia a animação
    setPath(newPath);
    onPathFound(newPath, distances[endNode]);
  };

  // Função para verificar se uma aresta faz parte do caminho atual
  const isEdgeInPath = (source: string, target: string) => {
    if (animationPath.length < 2) return false;
    
    for (let i = 0; i < animationPath.length - 1; i++) {
      if ((animationPath[i] === source && animationPath[i + 1] === target) ||
          (animationPath[i] === target && animationPath[i + 1] === source)) {
        return true;
      }
    }
    
    return false;
  };

  // Função para verificar se um nó faz parte do caminho atual
  const isNodeInPath = (nodeId: string) => {
    return animationPath.includes(nodeId);
  };

  // Função para obter a posição atual do objeto animado
  const getAnimatedPosition = () => {
    if (animationPath.length < 2 || !isAnimating) return null;
    
    const progress = animationProgress * (path.length - 1);
    const currentSegment = Math.min(Math.floor(progress), path.length - 2);
    const segmentProgress = progress - currentSegment;
    
    const sourceId = path[currentSegment];
    const targetId = path[currentSegment + 1];
    
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    if (!sourceNode || !targetNode) return null;
    
    const x = sourceNode.x + (targetNode.x - sourceNode.x) * segmentProgress;
    const y = sourceNode.y + (targetNode.y - sourceNode.y) * segmentProgress;
    
    return { x, y };
  };

  const animatedPosition = getAnimatedPosition();

  return (
    <div className="graph-container">
      <div className="controls">
        <div className="select-container">
          <label>Origem:</label>
          <select 
            value={startNode} 
            onChange={(e) => {
              setStartNode(e.target.value);
              setPath([]);
              setAnimationPath([]);
            }}
          >
            <option value="">Selecione...</option>
            {nodes.map(node => (
              <option key={`start-${node.id}`} value={node.id}>{node.name}</option>
            ))}
          </select>
        </div>
        
        <div className="select-container">
          <label>Destino:</label>
          <select 
            value={endNode} 
            onChange={(e) => {
              setEndNode(e.target.value);
              setPath([]);
              setAnimationPath([]);
            }}
          >
            <option value="">Selecione...</option>
            {nodes.map(node => (
              <option key={`end-${node.id}`} value={node.id}>{node.name}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={findShortestPath} 
          className="find-path-btn"
          disabled={isAnimating}
        >
          Encontrar Caminho
        </button>
        
        <button 
          onClick={generateRandomWeights} 
          className="random-weights-btn"
          disabled={isAnimating}
        >
          Gerar Pesos Aleatórios
        </button>
      </div>
      
      <div className="graph-visualization">
        <svg width="800" height="600">
          {/* Arestas */}
          {edges.map((edge, index) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const isInPath = isEdgeInPath(edge.source, edge.target);
            
            return (
              <g key={`edge-${index}`}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isInPath ? "#4CAF50" : "#333"}
                  strokeWidth={isInPath ? "4" : "2"}
                  className={isInPath ? "path-edge" : ""}
                />
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2}
                  textAnchor="middle"
                  dy="-5"
                  className="edge-weight"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}
          
          {/* Nós */}
          {nodes.map(node => {
            const isInPath = isNodeInPath(node.id);
            const isStart = node.id === startNode;
            const isEnd = node.id === endNode;
            
            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="40"
                  className={`node ${isStart ? 'start-node' : ''} ${isEnd ? 'end-node' : ''} ${isInPath ? 'path-node' : ''}`}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy="5"
                  className="node-label"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
          
          {/* Objeto animado */}
          {animatedPosition && (
            <circle
              cx={animatedPosition.x}
              cy={animatedPosition.y}
              r="15"
              className="animated-object"
            />
          )}
        </svg>
      </div>
    </div>
  );
};

export default Graph;
