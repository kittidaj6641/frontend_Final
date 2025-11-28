import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shrimp, ArrowLeft } from 'lucide-react';
import './ShrimpInfo.css';

// นำเข้ารูปภาพ
import shrimpAppearance from './background/shrimpAppearance.jpg';
import shrimpHabitat from './background/shrimpHabitat.jpg';
import shrimpFarming from './background/shrimpFarming.jpg';
import shrimpNutrition from './background/shrimpNutrition.jpg';
import shrimpCare from './background/shrimpCare.jpg';

const ShrimpInfo = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5 }}
            className="shrimp-info-page"
        >
            <header className="header">
                <nav className="nav">
                    <button
                        className="back-btnA"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft size={18} />
                        กลับสู่หน้าหลัก
                    </button>
                </nav>
            </header>

            <div className="shrimp-content">
                <h1><Shrimp size={32} /> รายละเอียดเกี่ยวกับกุ้งก้ามกราม</h1>
                <div className="shrimp-details">
                    <h2>ลักษณะทั่วไป</h2>
                    <img src={shrimpAppearance} alt="ลักษณะทั่วไปของกุ้งก้ามกราม" className="shrimp-image" />
                    <p>
                        กุ้งก้ามกราม (Macrobrachium rosenbergii) หรือที่รู้จักกันในชื่อกุ้งแม่น้ำ เป็นกุ้งน้ำจืดที่มีขนาดใหญ่ที่สุดในตระกูลกุ้งก้ามกราม 
                        มีลักษณะเด่นคือก้ามที่ยาวและใหญ่ โดยเฉพาะในตัวผู้ ซึ่งก้ามจะมีสีน้ำเงินเข้มหรือสีฟ้า 
                        ตัวเมียจะมีขนาดเล็กกว่าและก้ามไม่เด่นชัดเท่าตัวผู้
                    </p>

                    <h2>ถิ่นที่อยู่อาศัย</h2>
                    <img src={shrimpHabitat} alt="ถิ่นที่อยู่อาศัยของกุ้งก้ามกราม" className="shrimp-image" />
                    <p>
                        กุ้งก้ามกรามพบได้ในแหล่งน้ำจืด เช่น แม่น้ำ ลำคลอง และบึงที่มีน้ำไหลช้า 
                        ชอบน้ำที่มีความเค็มเล็กน้อยในช่วงวัยอ่อน (larval stage) และจะย้ายไปอยู่ในน้ำจืดเมื่อโตเต็มวัย 
                        อุณหภูมิที่เหมาะสมสำหรับการเจริญเติบโตคือ 26-32°C
                    </p>

                    <h2>การเพาะเลี้ยง</h2>
                    <img src={shrimpFarming} alt="การเพาะเลี้ยงกุ้งก้ามกราม" className="shrimp-image" />
                    <p>
                        การเพาะเลี้ยงกุ้งก้ามกรามในประเทศไทยได้รับความนิยมอย่างมาก เนื่องจากมีรสชาติอร่อยและให้ผลผลิตสูง 
                        การเลี้ยงต้องควบคุมคุณภาพน้ำอย่างเข้มงวด โดยเฉพาะระดับ pH (7.0-8.5), ออกซิเจนละลายน้ำ (≥ 5 mg/L), 
                        และความเค็ม (0-15 ppt) เพื่อให้กุ้งเจริญเติบโตได้ดี
                    </p>

                    <h2>คุณค่าทางโภชนาการ</h2>
                    <img src={shrimpNutrition} alt="คุณค่าทางโภชนาการของกุ้งก้ามกราม" className="shrimp-image" />
                    <p>
                        กุ้งก้ามกรามเป็นแหล่งโปรตีนชั้นดี มีไขมันต่ำ และอุดมไปด้วยวิตามินและแร่ธาตุ เช่น วิตามิน B12, ฟอสฟอรัส, 
                        และไอโอดีน เหมาะสำหรับผู้ที่ต้องการควบคุมน้ำหนักหรือรับประทานอาหารเพื่อสุขภาพ
                    </p>

                    <h2>การดูแลในฟาร์ม</h2>
                    <img src={shrimpCare} alt="การดูแลกุ้งก้ามกรามในฟาร์ม" className="shrimp-image" />
                    <p>
                        ฟาร์มของเราดูแลกุ้งก้ามกรามด้วยระบบจัดการคุณภาพน้ำที่ทันสมัย 
                        ใช้เทคโนโลยีตรวจวัดแบบเรียลไทม์เพื่อรักษาสภาพแวดล้อมให้เหมาะสม 
                        และมีการคัดเลือกพันธุ์กุ้งที่มีคุณภาพเพื่อให้ได้ผลผลิตที่แข็งแรงและมีขนาดใหญ่
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default ShrimpInfo;