"use client";

import { useState, useRef } from 'react'; // Menambahkan useRef ke import
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { Sun, Moon, Banknote, Info, Download } from 'lucide-react'; // Mengganti Scan menjadi Banknote
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function QRISGenerator() {
  const [amount, setAmount] = useState('');
  const [qrisData, setQrisData] = useState('');
  const qrRef = useRef<HTMLDivElement>(null); 
  const [darkMode, setDarkMode] = useState(false);

  const downloadQRIS = async () => {
    if (qrRef.current === null) return;
    
    try {
      const dataUrl = await toPng(qrRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff',
        style: {
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }
      });
      const link = document.createElement('a');
      link.download = `QRIS-${amount || 'pembayaran'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Gagal mendownload QRIS:', err);
    }
  };

  const calculateCRC16 = (str: string): string => {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      return new Intl.NumberFormat('id-ID').format(parseInt(numericValue));
    }
    return '';
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numeric = value.replace(/[^0-9]/g, '');
    setAmount(formatCurrency(numeric));
  };

  const generateQRIS = () => {
    if (!amount) return;
    
    const rawAmount = amount.replace(/[^0-9]/g, '');
    const part1 = "00020101021126610014COM.GO-JEK.WWW01189360091439373159350210G9373159350303UMI51440014ID.CO.QRIS.WWW0215ID10264800203400303UMI520450455303360";
    const part2 = "5802ID5925Dani Kurnia, Komputer & S6008SEMARANG61055027462070703A016304";
    const tag54 = `54${rawAmount.length.toString().padStart(2, '0')}${rawAmount}`;
    const fullPayloadWithoutCRC = part1 + tag54 + part2;
    const finalCRC = calculateCRC16(fullPayloadWithoutCRC);
    
    setQrisData(fullPayloadWithoutCRC + finalCRC);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <Card className={`w-full max-w-md p-8 rounded-3xl shadow-2xl transition-all border-none ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30">
              <Banknote className="w-6 h-6 text-white" /> {/* Menggunakan ikon Banknote */}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">QRIS Dinamis</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Generator Instan Paymnent
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl transition-all ${
              darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-5">
          <div>
            <label className={`text-sm font-semibold mb-2 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Nominal Transaksi
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-blue-500">Rp</span>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className={`pl-12 py-7 text-xl font-bold rounded-2xl border-2 transition-all ${
                  darkMode 
                    ? 'bg-gray-700/50 border-gray-600 focus:border-blue-500' 
                    : 'bg-gray-50 border-gray-100 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <Button
            onClick={generateQRIS}
            disabled={!amount || amount === '0'}
            className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/40 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            Buat Kode QRIS
          </Button>
        </div>

        {/* QR Display Area */}
        {qrisData ? (
          <div className="mt-8 space-y-4">
            {/* Wrapper Ref hanya untuk area QR dan nominal agar rapi saat didownload */}
            <div 
              ref={qrRef} 
              className={`p-6 rounded-3xl flex flex-col items-center ${
                darkMode ? 'bg-white text-gray-900' : 'bg-white border border-gray-100'
              }`}
            >
              <div className="mb-2 text-center">
                 <p className="text-[10px] font-bold text-blue-900 italic tracking-widest">QRIS</p>
              </div>
              
              <div className="p-2 bg-white rounded-xl">
                <QRCodeSVG
                  value={qrisData}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>
              
              <div className="text-center mt-4">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total Bayar</p>
                <p className="text-2xl font-black text-blue-600">Rp {amount}</p>
              </div>
            </div>

            <Button
              onClick={downloadQRIS}
              className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex gap-2 items-center justify-center font-bold shadow-lg shadow-emerald-500/20"
            >
              <Download size={20} />
              Simpan ke Galeri (PNG)
            </Button>
          </div>
        ) : (
          <div className="mt-8 py-12 flex flex-col items-center justify-center opacity-30">
            <Info size={48} className="mb-2" />
            <p className="text-sm">Masukkan nominal untuk membuat QR</p>
          </div>
        )}

        <p className="text-center mt-6 text-[10px] text-gray-400 tracking-tighter">
          Made with ❤️ and 🍜 by dkrnw
        </p>
      </Card>
    </div>
  );
}