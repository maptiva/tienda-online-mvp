import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiInfo, FiSmartphone, FiPrinter } from 'react-icons/fi';

interface QRKitProps {
    storeName: string;
    logoUrl?: string | null;
    storeSlug?: string | null;
}

const QRKit: React.FC<QRKitProps> = ({ storeName, logoUrl, storeSlug }) => {
    // URL completa de la tienda
    const storeUrl = `https://clicando.com.ar/${storeSlug || ''}`;

    const handleOpenPrintView = () => {
        // Crear una nueva ventana con el flyer
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor habilita las ventanas emergentes para ver el flyer.');
            return;
        }

        // HTML completo del flyer con estilos para impresión
        const flyerHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&display=swap" rel="stylesheet">
    <title>Flyer QR - ${storeName || 'Mi Tienda'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 40px;
            position: relative;
        }
        .header { display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center; }
        .logo-container { background: white; padding: 16px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); border: 2px solid #f3f4f6; }
        .logo { height: 160px; width: 160px; object-fit: contain; }
        .logo-fallback { width: 160px; height: 160px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 60px; font-weight: 900; color: #bfdbfe; }
        .welcome { font-size: 20px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: 8px; }
        .store-name { font-size: 48px; font-weight: 900; color: #111827; line-height: 1.2; }
        .qr-section { display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .qr-container { padding: 32px; background: white; border-radius: 50px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12); border: 2px solid #f3f4f6; }
        .scan-title { font-size: 36px; font-weight: 900; color: #2563eb; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
        .footer { width: 100%; padding-top: 24px; border-top: 2px solid #f3f4f6; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .description { font-size: 18px; color: #6b7280; font-weight: 600; max-width: 90%; text-align: center; line-height: 1.5; }
        .print-button { position: fixed; top: 20px; right: 20px; background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); display: flex; align-items: center; gap: 8px; }
        @media print { .print-button { display: none; } }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
    <div class="header">
        ${logoUrl ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" class="logo" /></div>` : `<div class="logo-fallback">${storeName?.[0] || 'T'}</div>`}
        <div><p class="welcome">Bienvenido a</p><h1 class="store-name">${storeName || 'Nuestra Tienda'}</h1></div>
    </div>
    <div class="qr-section">
        <div class="qr-container">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(storeUrl)}" alt="QR Code" width="240" height="240" />
        </div>
        <div><p class="scan-title">Escaneá y Pedí</p></div>
    </div>
    <div class="footer"><p class="description">Encontrá nuestro catálogo completo, precios y promociones siempre actualizados.</p></div>
</body>
</html>`;
        printWindow.document.write(flyerHTML);
        printWindow.document.close();
    };

    return (
        <div className='bg-gray-50 p-6 rounded-2xl border border-gray-200 mt-8 shadow-inner'>
            <div className='flex items-center gap-3 mb-6'>
                <div className='bg-blue-600 p-2 rounded-lg text-white'>
                    <FiSmartphone size={24} />
                </div>
                <div>
                    <h3 className='text-xl font-bold text-gray-800'>Kit de Difusión QR</h3>
                    <p className='text-sm text-gray-500'>Generá tu publicidad física y digital en segundos</p>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='space-y-4'>
                    <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm'>
                        <h4 className='font-bold text-gray-700 flex items-center gap-2 mb-2'>
                            <FiInfo className='text-blue-500' /> ¿Cómo usar tu kit?
                        </h4>
                        <ul className='text-sm text-gray-600 space-y-2'>
                            <li className='flex gap-2'><span className='font-bold text-blue-500'>1.</span><span>Hacé clic en "Ver Flyer para Imprimir".</span></li>
                            <li className='flex gap-2'><span className='font-bold text-blue-500'>2.</span><span>Se abrirá en una nueva pestaña.</span></li>
                            <li className='flex gap-2'><span className='font-bold text-blue-500'>3.</span><span>Usá <strong>Ctrl+P</strong> para imprimir o guardar como PDF.</span></li>
                        </ul>
                    </div>

                    <div className='bg-blue-50 p-4 rounded-xl border border-blue-100'>
                        <p className='text-sm text-blue-800'>💡 <strong>Tip Pro:</strong> Pegá el QR en tus bolsas de entrega.</p>
                    </div>

                    <button
                        onClick={handleOpenPrintView}
                        className='w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all transform active:scale-95 bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    >
                        <FiPrinter size={20} /> Ver Flyer para Imprimir
                    </button>
                </div>

                <div className='flex justify-center'>
                    <div className='flex flex-col items-center bg-gray-200 p-4 rounded-2xl overflow-hidden shadow-2xl max-w-[340px] border border-gray-300'>
                        <span className='text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest'>Vista Previa</span>
                        <div className='bg-white p-6 rounded-lg shadow-inner w-full space-y-4 text-center'>
                            {logoUrl ? (
                                <div className='flex justify-center'><img src={logoUrl} alt="Logo" className='h-20 w-20 object-contain' /></div>
                            ) : (
                                <div className='w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-2xl font-black text-blue-200'>{storeName?.[0]}</div>
                            )}
                            <div><h2 className='text-xl font-black text-gray-900'>{storeName || 'Nuestra Tienda'}</h2></div>
                            <div className='flex justify-center'><QRCodeSVG value={storeUrl} size={120} level="H" /></div>
                            <p className='text-sm font-black text-blue-600 uppercase'>Escaneá y Pedí</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRKit;
