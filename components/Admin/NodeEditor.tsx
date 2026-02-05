import React, { useState, useEffect } from 'react';
import { RiddleNode, QuestStatus, QuestionType, UnlockType } from '../../types';
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
    order: order,
    status: order === 0 ? QuestStatus.AVAILABLE : QuestStatus.LOCKED,

    // Question Defaults
    questionType: 'YEAR',
    historyQuestion: '',
    mediaUrl: '',
    correctYear: 0,
    correctAnswer: '',
    options: ['', '', '', ''],

    // Unlock Defaults
    unlockType: 'MATH',
    mathLogic: '(rakam_toplamı * 2)',
    mathResult: 0,
    unlockAnswer: '',
    unlockOptions: ['', '', '', ''],

    // Visual Defaults
    mapImageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000',
    targetZone: { x: 50, y: 50, radius: 15 },
    locationHint: '',
    rewardKeyId: `KEY-${Date.now()}`
  });

  // Helper to handle coordinate changes
  const handleZoneChange = (key: 'x' | 'y' | 'radius', value: string) => {
    const num = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      targetZone: { ...prev.targetZone, [key]: num }
    }));
  };

  // Helper for options
  const handleOptionChange = (index: number, value: string, isUnlock: boolean) => {
    const key = isUnlock ? 'unlockOptions' : 'options';
    const newOptions = [...(formData[key] || ['', '', '', ''])];
    newOptions[index] = value;
    setFormData({ ...formData, [key]: newOptions });
  };

  return (
    <div className="space-y-8">
      {/* --- QUESTION SECTION --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-2">1. Tarihsel Soru ve İçerik</h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Aşama Başlığı"
            placeholder="Örn: Mete Han'ın Mirası"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Soru Tipi</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-blue-500 text-sm"
              value={formData.questionType || 'YEAR'}
              onChange={e => setFormData({ ...formData, questionType: e.target.value as QuestionType })}
            >
              <option value="YEAR">Yıl Sorusu (Sayısal)</option>
              <option value="TEXT">Metin Cevap (Yazılı)</option>
              <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
            </select>
          </div>
        </div>

        <Input
          label="Medya URL (YouTube / Görsel) - Opsiyonel"
          placeholder="https://youtube.com/..."
          value={formData.mediaUrl || ''}
          onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
        />

        <TextArea
          label="Tarihsel Bilgi / Soru Metni"
          rows={3}
          value={formData.historyQuestion}
          onChange={e => setFormData({ ...formData, historyQuestion: e.target.value })}
        />

        {/* Conditional Question Answer Inputs */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          {(!formData.questionType || formData.questionType === 'YEAR') && (
            <Input
              label="Doğru Yıl (Cevap)"
              type="number"
              value={formData.correctYear}
              onChange={e => setFormData({ ...formData, correctYear: parseInt(e.target.value) || 0 })}
            />
          )}

          {formData.questionType === 'TEXT' && (
            <Input
              label="Doğru Cevap (Metin)"
              placeholder="Tam eşleşme aranır..."
              value={formData.correctAnswer || ''}
              onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
            />
          )}

          {formData.questionType === 'MULTIPLE_CHOICE' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Şıklar ve Doğru Cevap</label>
              {(formData.options || ['', '', '', '']).map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="flex items-center justify-center w-8 font-bold text-slate-400">{String.fromCharCode(65 + idx)}</div>
                  <Input
                    placeholder={`Seçenek ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value, false)}
                  />
                  <input
                    type="radio"
                    name="correctOption"
                    checked={formData.correctAnswer === opt && opt !== ''}
                    onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                    className="w-6 h-6 mt-2 accent-blue-600"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- UNLOCK / MATH SECTION --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-2">2. Şifre Çözme / Matematik</h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Kilit Tipi</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-blue-500 text-sm"
              value={formData.unlockType || 'MATH'}
              onChange={e => setFormData({ ...formData, unlockType: e.target.value as UnlockType })}
            >
              <option value="MATH">Matematik / Sayısal</option>
              <option value="TEXT">Metin Şifre</option>
              <option value="MULTIPLE_CHOICE">Çoktan Seçmeli</option>
            </select>
          </div>
          <Input
            label={formData.unlockType === 'MATH' ? "Matematik Mantığı" : "Şifre Sorusu / İpucu"}
            value={formData.mathLogic}
            onChange={e => setFormData({ ...formData, mathLogic: e.target.value })}
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          {(!formData.unlockType || formData.unlockType === 'MATH') && (
            <Input
              label="Kilit Kod (Sonuç)"
              type="number"
              value={formData.mathResult}
              onChange={e => setFormData({ ...formData, mathResult: parseInt(e.target.value) || 0 })}
            />
          )}

          {formData.unlockType === 'TEXT' && (
            <Input
              label="Kilit Şifresi (Metin)"
              value={formData.unlockAnswer || ''}
              onChange={e => setFormData({ ...formData, unlockAnswer: e.target.value })}
            />
          )}

          {formData.unlockType === 'MULTIPLE_CHOICE' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Şifre Seçenekleri</label>
              {(formData.unlockOptions || ['', '', '', '']).map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="flex items-center justify-center w-8 font-bold text-slate-400">{String.fromCharCode(65 + idx)}</div>
                  <Input
                    placeholder={`Seçenek ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value, true)}
                  />
                  <input
                    type="radio"
                    name="correctUnlockOption"
                    checked={formData.unlockAnswer === opt && opt !== ''}
                    onChange={() => setFormData({ ...formData, unlockAnswer: opt })}
                    className="w-6 h-6 mt-2 accent-purple-600"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- VISUALS & LOCATION SECTION --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        <h5 className="font-bold text-slate-800 border-b border-slate-100 pb-2">3. Görsel ve Konum</h5>

        <Input
          label="Harita/İpucu Görsel URL"
          value={formData.mapImageUrl}
          onChange={e => setFormData({ ...formData, mapImageUrl: e.target.value })}
        />

        {/* COORDINATE INPUTS - REQUESTED FEATURE */}
        <div className="grid grid-cols-3 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <Input
            label="X Konumu (%)"
            type="number"
            value={formData.targetZone?.x || 0}
            onChange={e => handleZoneChange('x', e.target.value)}
          />
          <Input
            label="Y Konumu (%)"
            type="number"
            value={formData.targetZone?.y || 0}
            onChange={e => handleZoneChange('y', e.target.value)}
          />
          <Input
            label="Yarıçap (px)"
            type="number"
            value={formData.targetZone?.radius || 0}
            onChange={e => handleZoneChange('radius', e.target.value)}
          />
        </div>

        <TextArea
          label="Konum İpucu Metni"
          rows={2}
          value={formData.locationHint}
          onChange={e => setFormData({ ...formData, locationHint: e.target.value })}
        />
      </div>

      <div className="flex gap-4 pt-4 justify-end border-t border-slate-100 sticky bottom-0 bg-white/90 backdrop-blur p-4 z-10">
        <Button variant="ghost" onClick={onCancel}>İptal</Button>
        <Button variant="primary" onClick={() => onSave(formData)}>Değişiklikleri Kaydet</Button>
      </div>
    </div>
  );
};

export default NodeEditor;
