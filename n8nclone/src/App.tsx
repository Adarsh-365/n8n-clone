import React, { useCallback, useState } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import { PromptNode, ProcessingNode, OutputNode } from './nodes';

import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: 'Prompt', type: 'prompt', position: { x: 0, y: 0 }, data: { label: 'Prompt' } },
  { id: '2', type: 'processing', position: { x: 200, y: 0 }, data: { label: 'Processing' } },
  { id: '3', type: 'output', position: { x: 400, y: 0 }, data: { label: 'Output' } },
];
const initialEdges = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const nodeTypes = {
    prompt: PromptNode,
    processing: ProcessingNode,
    output: OutputNode,
  };

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Add state for prompt input and processing select
  const [promptValue, setPromptValue] = useState('');
  const [processingOption, setProcessingOption] = useState('option1');

  // Add state for Run/Stop
  const [isRunning, setIsRunning] = useState(false);

  // Add state for output from server
  const [outputValue, setOutputValue] = useState('');

  // Node click handler
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  // Drag state for modal
  const [modalPos, setModalPos] = useState({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 60 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Mouse event handlers for modal drag
  const onModalMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragOffset({
      x: e.clientX - modalPos.x,
      y: e.clientY - modalPos.y,
    });
    e.preventDefault();
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e: MouseEvent) => {
      setModalPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };
    const onMouseUp = () => setDragging(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, dragOffset]);

  // Reset modal position when opening
  React.useEffect(() => {
    if (modalOpen) {
      setModalPos({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 60 });
    }
  }, [modalOpen]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Export Flow button */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 30,
        zIndex: 1100,
        display: 'flex',
        gap: 10,
      }}>
        <button
          style={{
            padding: '8px 18px',
            borderRadius: 5,
            border: 'none',
            background: '#2196f3',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            transition: 'background 0.2s',
          }}
          onClick={() => {
            const flow = { nodes, edges };
            const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flow.json';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export Flow
        </button>
        <button
          style={{
            padding: '8px 18px',
            borderRadius: 5,
            border: 'none',
            background: '#ff9800',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            transition: 'background 0.2s',
          }}
          onClick={async () => {
            // Send flow JSON
            const flow = { nodes, edges };
            await fetch('http://localhost:8000/main', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(flow),
            });
            // Send prompt/options JSON and receive output
            const promptData = {
              prompt: promptValue,
              option: processingOption,
            };
            const resp = await fetch('http://localhost:8000/main', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(promptData),
            });
            let output = '';
            try {
              output = await resp.text();
            } catch (e) {
              output = 'Error receiving output';
            }
            setOutputValue(output);
            alert('Flow and prompt data sent!');
          }}
        >
          Send to Server
        </button>
        {/* Run/Stop buttons */}
        <button
          style={{
            padding: '8px 18px',
            borderRadius: 5,
            border: 'none',
            background: isRunning ? '#ccc' : '#4caf50',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            cursor: isRunning ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            transition: 'background 0.2s',
          }}
          disabled={isRunning}
          onClick={() => setIsRunning(true)}
        >
          Run
        </button>
        <button
          style={{
            padding: '8px 18px',
            borderRadius: 5,
            border: 'none',
            background: isRunning ? '#f44336' : '#ccc',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            cursor: isRunning ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            transition: 'background 0.2s',
          }}
          disabled={!isRunning}
          onClick={() => setIsRunning(false)}
        >
          Stop
        </button>
      </div>
      <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid={true}
          snapGrid={[15, 15]}
          onNodeClick={onNodeClick}
        />
        {/* Modal */}
        {modalOpen && selectedNode && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setModalOpen(false)}
          >
            <div
              style={{
                background: '#fff',
                padding: 24,
                borderRadius: 8,
                minWidth: 300,
                minHeight: 120,
                position: 'absolute',
                left: modalPos.x,
                top: modalPos.y,
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
                cursor: dragging ? 'grabbing' : 'default',
                userSelect: 'none',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div
                style={{
                  width: '100%',
                  height: 28,
                  cursor: 'grab',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  background: '#f0f0f0',
                  zIndex: 2,
                }}
                onMouseDown={onModalMouseDown}
              />
              <button
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'transparent',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  zIndex: 3,
                }}
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
              <div style={{ marginTop: 28 }}>
                {selectedNode.type === 'prompt' && (
                  <div>
                    <h3>Prompt Node</h3>
                    <input
                      type='text'
                      placeholder='Enter prompt...'
                      value={promptValue}
                      onChange={e => setPromptValue(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        margin: '8px 0',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <p>This is the Prompt node popup.</p>
                  </div>
                )}
                {selectedNode.type === 'processing' && (
                  <div>
                    <h3>Processing Node</h3>
                    <select
                      value={processingOption}
                      onChange={e => setProcessingOption(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        margin: '8px 0',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                        background: '#fafafa',
                      }}
                    >
                      <option value='option1'>Option 1</option>
                      <option value='option2'>Option 2</option>
                    </select>
                    <p>This is the Processing node popup.</p>
                  </div>
                )}
                {selectedNode.type === 'output' && (
                  <div>
                    <h3>Output Node</h3>
                    <p>This is the Output node popup.</p>
                    <div
                      style={{
                        marginTop: 12,
                        padding: '8px',
                        background: '#f5f5f5',
                        borderRadius: 4,
                        minHeight: 40,
                        fontFamily: 'monospace',
                        fontSize: 15,
                        color: '#333',
                        wordBreak: 'break-word',
                      }}
                    >
                      {outputValue || <span style={{ color: '#aaa' }}>No output yet.</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}