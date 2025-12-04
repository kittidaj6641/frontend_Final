import React, { useState } from 'react';

// 1. Mock Data: สมมติว่าเป็นข้อมูลจากฐานข้อมูล
const mockData = Array.from({ length: 55 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'Admin' : 'User',
  status: i % 4 === 0 ? 'Inactive' : (i % 3 === 0 ? 'Pending' : 'Active'),
  lastLogin: '2025-12-04',
}));

const DataTable = () => {
  // 2. State สำหรับ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // จำนวนแถวต่อหน้า

  // 3. Logic คำนวณการตัดข้อมูล (Slicing)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mockData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(mockData.length / itemsPerPage);

  // ฟังก์ชันเปลี่ยนหน้า
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ฟังก์ชันเลือกสีของ Status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">ตารางข้อมูลผู้ใช้งานทั้งหมด</h2>

      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">ชื่อ</th>
              <th scope="col" className="px-6 py-3">อีเมล</th>
              <th scope="col" className="px-6 py-3">บทบาท</th>
              <th scope="col" className="px-6 py-3">สถานะ</th>
              <th scope="col" className="px-6 py-3">ใช้งานล่าสุด</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">#{item.id}</td>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.email}</td>
                <td className="px-6 py-4">{item.role}</td>
                <td className="px-6 py-4">
                  {/* แถบแสดงสถานะ (Status Badge) */}
                  <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">{item.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ส่วนควบคุม Pagination และ Info */}
      <div className="flex flex-col items-center justify-between p-4 space-y-3 md:flex-row md:space-y-0 bg-white border-t">
        
        {/* แสดงข้อมูลสถานะจำนวน (Info) */}
        <span className="text-sm font-normal text-gray-500">
          แสดง <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, mockData.length)}</span> จากทั้งหมด <span className="font-semibold text-gray-900">{mockData.length}</span> รายการ
        </span>

        {/* ปุ่มเปลี่ยนหน้า (Buttons) */}
        <ul className="inline-flex items-center -space-x-px">
          <li>
            <button 
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50"
            >
              ย้อนกลับ
            </button>
          </li>
          
          {/* Loop สร้างปุ่มตัวเลขหน้า */}
          {[...Array(totalPages)].map((_, index) => (
             <li key={index}>
              <button
                onClick={() => paginate(index + 1)}
                className={`px-3 py-2 leading-tight border border-gray-300 ${currentPage === index + 1 ? 'bg-blue-50 text-blue-600 font-bold' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
              >
                {index + 1}
              </button>
            </li>
          ))}

          <li>
            <button 
              onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50"
            >
              ถัดไป
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DataTable;
