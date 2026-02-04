import React, { useState } from 'react';
import { RiddleNode, QuestStatus } from '../../types';
import { Button, Input, TextArea } from './MaterialUI';

interface NodeEditorProps {
  node?: RiddleNode;
  onSave: (node: RiddleNode) => void;
  onCancel: () => void;
  order: number;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ node, onSave, onCancel, order }) => {
  const [formData, setFormData] = useState<RiddleNode>(node || {
    id: `node-${Date.now()}`,
    title: '',
    historyQuestion: '',
    correctYear: 0,
    mathLogic: '(rakam_toplamı * 2)',
    mathResult: 0,
    locationHint: '',
    mapImageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000',
    targetZone: { x: 50, y: 50, radius: 15 },
    rewardKeyId: `KEY-${Date.now()}`,
    status: order === 0 ? QuestStatus.AVAILABLE : QuestStatus.LOCKED,
    order: order
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Aşama Başlığı"
          placeholder="Örn: Mete Han'ın Mirası"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
        <Input
          label="Doğru Yıl (Miladi)"
          type="number"
          value={formData.correctYear}
          onChange={e => setFormData({ ...formData, correctYear: parseInt(e.target.value) || 0 })}
        />
      </div>

      <TextArea
        label="Tarihsel Bilgi / Soru"
        rows={3}
        placeholder="Müze içinde bu aşama için sorulacak soru..."
        value={formData.historyQuestion}
        onChange={e => setFormData({ ...formData, historyQuestion: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Matematik Mantığı"
          value={formData.mathLogic}
          onChange={e => setFormData({ ...formData, mathLogic: e.target.value })}
        />
        <Input
          label="Kilit Kod (Sonuç)"
          type="number"
          value={formData.mathResult}
          onChange={e => setFormData({ ...formData, mathResult: parseInt(e.target.value) || 0 })}
        />
      </div>

      <Input
        label="Harita/İpucu Görsel URL"
        value={formData.mapImageUrl}
        onChange={e => setFormData({ ...formData, mapImageUrl: e.target.value })}
      />

      <TextArea
        label="Konum İpucu Metni"
        rows={2}
        placeholder="Müze içindeki fiziksel konumu tarif edin..."
        value={formData.locationHint}
        onChange={e => setFormData({ ...formData, locationHint: e.target.value })}
      />

      <div className="flex gap-4 pt-4 justify-end border-t border-slate-100">
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
        <Button variant="primary" onClick={() => onSave(formData)}>Değişiklikleri Kaydet</Button>
      </div>
    </div>
  );
};

export default NodeEditor;
