import { useState } from 'react';
import './App.css';
import Graph from './components/Graph';

function App() {
  const [path, setPath] = useState<string[]>([]);
  const [distance, setDistance] = useState<number>(0);

  const handlePathFound = (foundPath: string[], totalDistance: number) => {
    setPath(foundPath);
    setDistance(totalDistance);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Modelos de IA - Algoritmo de Dijkstra</h1>
        <p>Selecione os pontos de origem e destino para encontrar o melhor caminho entre modelos</p>
      </header>
      
      <main>
        <Graph onPathFound={handlePathFound} />
        
        {path.length > 0 && (
          <div className="result-container">
            <h2>Resultado</h2>
            <p>
              <strong>Caminho mais curto:</strong>{' '}
              {path.map((nodeId, index) => {
                // Converte o ID para o nome com primeira letra maiúscula
                const nodeName = nodeId.charAt(0).toUpperCase() + nodeId.slice(1);
                return (
                  <span key={nodeId}>
                    {nodeName}
                    {index < path.length - 1 ? ' → ' : ''}
                  </span>
                );
              })}
            </p>
            <p>
              <strong>Distância total:</strong> {distance}
            </p>
          </div>
        )}
      </main>
      
      <footer>
        <p>Visualização de Modelos de IA com Algoritmo de Dijkstra</p>
      </footer>
    </div>
  );
}

export default App;
