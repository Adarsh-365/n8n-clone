import React from 'react';
import { Handle, Position } from '@xyflow/react';

// 1. Custom node component with right handle
export function PromptNode({ data }: any) {
  return (
    <div style={{ padding: 10, border: '1px solid #888', borderRadius: 5, background: '#fff' }}>
      <div>{data.label}</div>
      {/* Right handle */}
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
}

// 2. Custom node component with left and right handles
export function ProcessingNode({ data }: any) {
  return (
    <div style={{ padding: 10, border: '1px solid #888', borderRadius: 5, background: '#fff' }}>
      {/* Left handle */}
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <div>{data.label}</div>
      {/* Right handle */}
      <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    </div>
  );
}

// 3. Custom node component with left handle
export function OutputNode({ data }: any) {
  return (
    <div style={{ padding: 10, border: '1px solid #888', borderRadius: 5, background: '#fff' }}>
      {/* Left handle */}
      <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
      <div>{data.label}</div>
    </div>
  );
}
