// src/Home.js — เพิ่มเมนู "ตั้งค่าเกณฑ์" ใน Quick Actions
// (แสดงเฉพาะส่วนที่เปลี่ยน — เมนูด่วน + import)

/*
  สิ่งที่ต้องเปลี่ยนใน Home.js:
  
  1. เพิ่ม import:
     import { SlidersHorizontal } from 'lucide-react';
  
  2. เปลี่ยน menu-grid จาก 2x2 เป็น 2x3 (เพิ่ม 1 ปุ่ม) 
     หรือคงไว้ 2x2 แล้วเพิ่ม row ล่าง
  
  3. เพิ่มปุ่มใหม่:
*/

// ─── ตัวอย่างปุ่มใหม่ที่ต้องเพิ่มใน menu-grid ───────────────────────────────
/*
<button
  className="menu-btn btn-slate"
  onClick={() => navigate('/threshold-settings')}
>
  <div className="btn-icon"><SlidersHorizontal size={20} /></div>
  ตั้งค่าเกณฑ์คุณภาพน้ำ
</button>
*/

// ─── CSS เพิ่มเติมใน Home.css (btn-slate variant) ────────────────────────────
/*
.btn-slate {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-color: #cbd5e1;
  color: #334155;
  box-shadow: 0 4px 15px rgba(51,65,85,0.08);
}
.btn-slate:not(:disabled):hover { background: #e2e8f0; border-color: #94a3b8; color: #0f172a; }
.btn-slate .btn-icon { background: #cbd5e1; color: #475569; }
*/

// ─── App.js Route เพิ่มเติม ───────────────────────────────────────────────────
/*
  ใน App.js ให้เพิ่ม Route:
  
  import ThresholdSettings from './ThresholdSettings';
  
  <Route path="/threshold-settings" element={<ThresholdSettings />} />
*/

export const HOME_CHANGES = `
เปลี่ยนแปลงใน Home.js:

1. เพิ่ม import ใน lucide-react:
   SlidersHorizontal

2. เพิ่มปุ่มในเมนูด่วน (หลังปุ่ม btn-amber):
   <button
     className="menu-btn btn-slate"
     onClick={() => navigate('/threshold-settings')}
   >
     <div className="btn-icon"><SlidersHorizontal size={20} /></div>
     ตั้งค่าเกณฑ์คุณภาพน้ำ
   </button>

3. เพิ่มใน Home.css (btn-slate):
   .btn-slate {
     background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
     border-color: #cbd5e1;
     color: #334155;
     box-shadow: 0 4px 15px rgba(51,65,85,0.08);
   }
   .btn-slate:not(:disabled):hover {
     background: #e2e8f0;
     border-color: #94a3b8;
     color: #0f172a;
   }
   .btn-slate .btn-icon { background: #cbd5e1; color: #475569; }

4. ใน App.js เพิ่ม Route:
   import ThresholdSettings from './ThresholdSettings';
   <Route path="/threshold-settings" element={<ThresholdSettings />} />
`;
