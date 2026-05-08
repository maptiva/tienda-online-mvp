import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiInfo, FiSmartphone, FiPrinter } from 'react-icons/fi';

interface QRKitProps {
    storeName: string;
    logoUrl?: string | null;
    storeSlug?: string | null;
}

const QRKit: React.FC<QRKitProps> = ({ storeName, logoUrl, storeSlug }) => {
    const storeUrl = `https://clicando.com.ar/${storeSlug || ''}`;

    const handleOpenPrintView = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Por favor habilita las ventanas emergentes para ver el flyer.');
            return;
        }

        const flyerHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <title>Flyer QR - ${storeName || 'Mi Tienda'}</title>
    <style>
@page { size: A4 portrait; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            width: 210mm;
            height: 297mm;
            overflow: hidden;
            background: white;
        }
        /* PÁGINA */
        .page {
            width: 210mm;
            height: 297mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 16px 52px;
            background: white;
        }
        /* LOGO */
        .logo-container {
            background: white;
            padding: 10px;
            border-radius: 22px;
            box-shadow: 0 16px 32px rgba(0,0,0,0.09);
            border: 2px solid #f3f4f6;
            display: inline-block;
        }
        .logo { height: 200px; width: 200px; object-fit: contain; display: block; }
        .logo-fallback {
            width: 200px; height: 200px;
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 88px; font-weight: 900; color: #93c5fd;
        }
        /* NOMBRE + DESCRIPCIÓN */
        .store-info { text-align: center; display: flex; flex-direction: column; gap: 8px; }
        .welcome {
            font-size: 11px; font-weight: 700; color: #3b82f6;
            text-transform: uppercase; letter-spacing: 0.45em;
        }
        .store-name {
            font-size: 36px; font-weight: 900; color: #111827;
            line-height: 1.05; letter-spacing: -0.02em;
        }
        .store-description {
            font-size: 15px; color: #6b7280; font-weight: 500;
            line-height: 1.5; max-width: 80%; margin: 0 auto;
        }
        /* QR */
        .qr-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .qr-container {
            padding: 16px; background: white;
            border-radius: 28px;
            box-shadow: 0 12px 36px rgba(0,0,0,0.09);
            border: 2px solid #f3f4f6;
        }
        .scan-title {
            font-size: 20px; font-weight: 900; color: #2563eb;
            text-transform: uppercase; letter-spacing: 0.25em;
        }
        /* CLICANDO — card clara con texto oscuro (estilo landing) */
        .clicando-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            margin-top: 14px;
            width: 100%;
        }
        .clicando-card {
            background: #ffffff;
            border-radius: 24px;
            padding: 14px 40px 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            border: 1.5px solid #e2e8f0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            text-align: center;
            width: calc(100% - 48px);
        }
        .trusted-label {
            font-size: 10px; font-weight: 700; color: #94a3b8;
            text-transform: uppercase; letter-spacing: 0.28em;
        }
        .clicando-big {
            font-size: 34px; font-weight: 900; color: #0f172a;
            letter-spacing: -0.02em; line-height: 1;
        }
        .clicando-sub {
            font-size: 9px; font-weight: 600; color: #94a3b8;
            text-transform: uppercase; letter-spacing: 0.22em; margin-top: 2px;
        }
        /* CLICANDO URL — fuera del card */
        .clicando-url {
            font-size: 13px; font-weight: 600; color: #374151;
            letter-spacing: 0.04em;
        }
        /* BOTÓN IMPRIMIR */
        .print-button {
            position: fixed; top: 16px; right: 16px;
            background: #2563eb; color: white; border: none;
            padding: 10px 20px; border-radius: 8px;
            font-size: 14px; font-weight: 700; cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.20);
            display: flex; align-items: center; gap: 6px;
            font-family: inherit; z-index: 999;
        }
        .print-button:hover { background: #1d4ed8; }
        @media print { .print-button { display: none; } }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
    <div class="page">

        <!-- Logo -->
        ${logoUrl
            ? `<div class="logo-container"><img src="${logoUrl}" alt="Logo" class="logo" /></div>`
            : `<div class="logo-fallback">${storeName?.[0] || 'T'}</div>`
        }

        <!-- Nombre + Descripción -->
        <div class="store-info">
            <p class="welcome">Bienvenido a</p>
            <h1 class="store-name">${storeName || 'Nuestra Tienda'}</h1>
            <p class="store-description">Encontrá nuestro catálogo completo, precios y promociones siempre actualizados.</p>
        </div>

        <!-- QR -->
        <div class="qr-wrap">
            <div class="qr-container">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(storeUrl)}" alt="QR Code" width="140" height="140" />
            </div>
            <p class="scan-title">Escaneá y Pedí</p>
        </div>

        <!-- Bloque Clicando (card + url, con margen extra arriba) -->
        <div class="clicando-section">
            <div class="clicando-card">
                <p class="trusted-label">Esta tienda confía en</p>
                <p class="clicando-big">Clicando</p>
                <p class="clicando-sub">Tu Ciudad Online &nbsp;·&nbsp; Catálogo Digital &nbsp;·&nbsp; WhatsApp Integrado</p>
            </div>
            <p class="clicando-url">clicando.com.ar</p>
        </div>

    </div>
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

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>
                {/* Columna instrucciones */}
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
                        <p className='text-sm text-blue-800'>💡 <strong>Tip Pro:</strong> Pegá el QR en tus bolsas de entrega. El cliente escanea, ve tu catálogo y te vuelve a comprar directo.</p>
                    </div>
                    <button
                        onClick={handleOpenPrintView}
                        className='w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all transform active:scale-95 bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-200'
                    >
                        <FiPrinter size={20} /> Ver Flyer para Imprimir
                    </button>
                </div>

                {/* Vista previa */}
                <div className='flex justify-center'>
                    <div className='flex flex-col items-center bg-gray-100 p-4 rounded-2xl shadow-xl w-[240px] border border-gray-200 gap-2'>
                        <span className='text-[10px] text-gray-400 uppercase font-bold tracking-widest'>Vista Previa</span>

                        {/* Logo */}
                        {logoUrl ? (
                            <div className='bg-white p-2 rounded-xl shadow border border-gray-100'>
                                <img src={logoUrl} alt="Logo" className='h-12 w-12 object-contain' />
                            </div>
                        ) : (
                            <div className='w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-xl font-black text-blue-200'>{storeName?.[0]}</div>
                        )}

                        {/* Nombre + Descripción */}
                        <div className='text-center px-1'>
                            <p className='text-[7px] font-bold text-blue-500 uppercase tracking-widest'>Bienvenido a</p>
                            <h2 className='text-sm font-black text-gray-900 leading-tight'>{storeName || 'Nuestra Tienda'}</h2>
                            <p className='text-[7.5px] text-gray-400 font-medium mt-1 leading-relaxed'>Encontrá nuestro catálogo completo, precios y promociones siempre actualizados.</p>
                        </div>

                        {/* QR */}
                        <div className='bg-white p-3 rounded-2xl shadow border border-gray-100'>
                            <QRCodeSVG value={storeUrl} size={80} level="H" />
                        </div>
                        <p className='text-[8px] font-black text-blue-600 uppercase tracking-widest'>Escaneá y Pedí</p>

                        {/* Bloque Clicando con margen extra arriba */}
                        <div className='flex flex-col items-center gap-1.5 mt-2 w-full'>
                            <div className='w-[88%] bg-white rounded-2xl px-4 py-2.5 text-center flex flex-col items-center gap-0.5 border border-gray-200 shadow-sm'>
                                <p className='text-[6px] font-bold text-slate-400 uppercase tracking-widest'>Esta tienda confía en</p>
                                <p className='text-sm font-black text-slate-900 leading-none tracking-tight'>Clicando</p>
                                <p className='text-[5.5px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5'>Tu Ciudad Online · Catálogo Digital · WhatsApp</p>
                            </div>
                            <p className='text-[9px] font-semibold text-gray-600 tracking-wide'>clicando.com.ar</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRKit;
