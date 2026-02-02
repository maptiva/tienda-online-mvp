import React, { useState, useEffect, useRef } from 'react';
import { leadsService } from '../../../modules/crm/services/leadsService';
import { supabase } from '../../../services/supabase';
import Swal from 'sweetalert2';
import { FiUserPlus, FiPhone, FiMail, FiCalendar, FiCheckCircle, FiXCircle, FiMoreVertical, FiSearch, FiFilter, FiUpload } from 'react-icons/fi';
import { Loading } from '../../../components/dashboard/Loading'; // Reutilizando componente de carga

const LeadStatusBadge = ({ status }) => {
    const styles = {
        NEW: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nuevo' },
        CONTACTED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Contactado' },
        INTERESTED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Interesado' },
        CONVERTED: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Convertido' },
        LOST: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Perdido' }
    };

    const style = styles[status] || styles.NEW;

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    );
};

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        business_name: '',
        name: '',
        email: '',
        phone: '',
        source: 'Instagram',
        notes: '',
        status: 'NEW'
    });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const data = await leadsService.fetchLeads();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
            Swal.fire('Error', 'No se pudieron cargar los leads', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLead) {
                await leadsService.updateLead(editingLead.id, formData);
                Swal.fire('Actualizado', 'Lead actualizado correctamente', 'success');
            } else {
                await leadsService.createLead(formData);
                Swal.fire('Creado', 'Lead creado correctamente', 'success');
            }
            setIsModalOpen(false);
            fetchLeads();
            resetForm();
        } catch (error) {
            console.error('Error saving lead:', error);
            Swal.fire('Error', 'No se pudo guardar el lead', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            business_name: '',
            name: '',
            email: '',
            phone: '',
            source: 'Instagram',
            notes: '',
            status: 'NEW'
        });
        setEditingLead(null);
    };

    const openModal = (lead = null) => {
        if (lead) {
            setEditingLead(lead);
            setFormData({
                business_name: lead.business_name || '',
                name: lead.name,
                email: lead.email || '',
                phone: lead.phone || '',
                source: lead.source || 'Instagram',
                notes: lead.notes || '',
                status: lead.status || 'NEW'
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const rows = text.split('\n');
            const leadsToImport = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) continue;

                // Handle potential different line endings or slight format variations if needed
                // Using simple split by semicolon as requested
                const parts = row.split(';');
                if (parts.length >= 2) {
                    const fullName = parts[0].trim();
                    const phone = parts[1].trim();

                    if (fullName && phone) {
                    // Extract contact person's name and business name from full name
                    let business_name = fullName;
                    let contact_name = 'Importado CSV';
                    
                    const words = fullName.split(' ');
                    if (words.length > 1) {
                        const firstName = words[0];
                        // Normalize for comparison without accents
                        const normalizeString = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                        
                        // Common business words that should NOT be treated as contact names
                        const businessWords = ['tienda', 'libreria', 'distribuidora', 'heladeria', 'jugueteria', 'veterinaria', 'pintureria', 'papeleria'];
                        // Common first names
                        const commonNames = ['noelia', 'juan', 'ruben', 'rosario', 'carina', 'karen', 'paula', 'jesica', 'marilin', 'laura', 'ariana', 'ivan', 'emanuel', 'ana', 'luciano', 'sebastian', 'gustavo', 'clarisa', 'adriana', 'natalia', 'carla', 'delfina', 'ursula', 'mauricio', 'veronica', 'manuela', 'matias', 'elsa'];
                        
                        const normalizedFirstName = normalizeString(firstName);
                        
                        if (firstName.length >= 3 && firstName.length <= 15 && 
                            /^[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]*$/.test(firstName) &&
                            !businessWords.includes(normalizedFirstName) &&
                            commonNames.includes(normalizedFirstName)) {
                            contact_name = firstName;
                            business_name = words.slice(1).join(' ').trim();
                        }
                    }
                        
                        leadsToImport.push({
                            business_name: business_name,
                            phone: phone,
                            name: contact_name,
                            source: 'Otro',
                            status: 'NEW'
                        });
                    }
                }
            }

            if (leadsToImport.length > 0) {
                try {
                    setLoading(true);
                    await leadsService.importLeads(leadsToImport);
                    Swal.fire('Importado', `${leadsToImport.length} leads importados correctamente`, 'success');
                    fetchLeads();
                } catch (error) {
                    console.error('Error importing leads:', error);
                    Swal.fire('Error', 'Hubo un error al importar los leads', 'error');
                } finally {
                    setLoading(false);
                }
            } else {
                Swal.fire('Atención', 'No se encontraron leads válidos en el archivo (Formato: Nombre;Teléfono)', 'warning');
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await leadsService.deleteLead(id);
                Swal.fire('Eliminado', 'El lead ha sido eliminado.', 'success');
                fetchLeads();
            } catch (error) {
                Swal.fire('Error', 'Hubo un problema al eliminar.', 'error');
            }
        }
    };

    const handleConvertToClient = async (lead) => {
        const result = await Swal.fire({
            title: '¡Convertir a Cliente!',
            text: `Se creará un nuevo cliente basado en ${lead.name}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, convertir',
            confirmButtonColor: '#5FAFB8'
        });

        if (result.isConfirmed) {
            try {
                const clientData = {
                    name: lead.name,
                    contact_email: lead.email,
                    contact_phone: lead.phone,
                    notes: `Convertido desde Lead. Origen: ${lead.source}. Notas previas: ${lead.notes}`
                };
                await leadsService.convertToClient(lead.id, clientData);
                Swal.fire('¡Felicidades!', 'Nuevo cliente creado y lead actualizado.', 'success');
                fetchLeads();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo convertir el lead.', 'error');
            }
        }
    };

const filteredLeads = leads.filter(lead => {
        const matchesSearch = transform(lead.name).includes(transform(searchTerm)) ||
            transform(lead.email).includes(transform(searchTerm)) ||
            transform(lead.business_name).includes(transform(searchTerm));
        const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    function transform(str) {
        return (str || '').toLowerCase();
    }

    if (loading) return <Loading message="Cargando Leads..." />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header style based on Clients.jsx */}
            <div className="mb-2 flex justify-between items-end border-b border-white pb-1 mt-0">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tighter italic leading-none">
                        Gestión de Leads
                    </h1>
                    <p className="text-gray-400 text-[10px] md:text-xs mt-1 uppercase tracking-[0.2em] font-black opacity-50">
                        Oportunidades Comerciales
                    </p>
                </div>
            </div>

            {/* Action Bar - Button Left */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv,.txt"
                    className="hidden"
                />
                <div className="flex gap-4">
                    <button
                        onClick={() => openModal()}
                        className="bg-emerald-500 text-white p-2 px-6 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm uppercase tracking-wider h-fit"
                    >
                        <FiUserPlus className="text-lg" /> + Nuevo Lead
                    </button>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="bg-blue-500 text-white p-2 px-6 rounded-xl font-bold shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm uppercase tracking-wider h-fit"
                    >
                        <FiUpload className="text-lg" /> Importar CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por contacto, email o negocio..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FAFB8]/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <FiFilter className="text-gray-400" />
                    {[
                        { id: 'ALL', label: 'Todos' },
                        { id: 'NEW', label: 'Nuevo' },
                        { id: 'CONTACTED', label: 'Contactado' },
                        { id: 'INTERESTED', label: 'Interesado' },
                        { id: 'CONVERTED', label: 'Convertido' },
                        { id: 'LOST', label: 'Perdido' }
                    ].map(statusObj => (
                        <button
                            key={statusObj.id}
                            onClick={() => setStatusFilter(statusObj.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${statusFilter === statusObj.id
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {statusObj.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leads List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => (
                    <div key={lead.id} className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:border-[#5FAFB8]/30 transition-all group relative">

                        <div className="flex justify-between items-start mb-4">
                            <LeadStatusBadge status={lead.status} />
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(lead)} className="p-1.5 text-gray-400 hover:text-blue-500 bg-gray-50 rounded-lg">
                                    <span className="text-xs">✏️</span>
                                </button>
                                <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg">
                                    <span className="text-xs">🗑️</span>
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-0">{lead.business_name || lead.name}</h3>
                        {lead.business_name && <p className="text-sm text-gray-500 font-medium mb-1">{lead.name}</p>}
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-4">{lead.source}</p>

                        <div className="space-y-2 mb-6">
                            {lead.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiMail className="text-gray-400" /> {lead.email}
                                </div>
                            )}
                            {lead.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiPhone className="text-gray-400" />
                                    <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#5FAFB8] hover:underline">
                                        {lead.phone}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500 italic mt-2">
                                <FiCalendar className="text-gray-400" /> Creado: {new Date(lead.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {lead.notes && (
                            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 italic mb-4 line-clamp-2 border border-gray-100">
                                "{lead.notes}"
                            </div>
                        )}

                        {lead.status !== 'CONVERTED' && (
                            <button
                                onClick={() => handleConvertToClient(lead)}
                                className="w-full py-2 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <FiCheckCircle /> Convertir a Cliente
                            </button>
                        )}
                    </div>
                ))}

                {filteredLeads.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="italic">No se encontraron leads con estos criterios.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">{editingLead ? 'Editar Lead' : 'Nuevo Lead'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><FiXCircle size={24} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Negocio / Tienda</label>
                                <input
                                    type="text"
                                    name="business_name"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5FAFB8]"
                                    value={formData.business_name}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Tienda Los Angeles"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de Contacto</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5FAFB8]"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5FAFB8]"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5FAFB8]"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Origen</label>
                                    <select
                                        name="source"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5FAFB8]"
                                        value={formData.source}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Instagram">Instagram</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Web">Web</option>
                                        <option value="Referido">Referido</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estado</label>
                                    <select
                                        name="status"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5FAFB8]"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="NEW">Nuevo</option>
                                        <option value="CONTACTED">Contactado</option>
                                        <option value="INTERESTED">Interesado</option>
                                        <option value="CONVERTED">Convertido</option>
                                        <option value="LOST">Perdido</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notas</label>
                                <textarea
                                    name="notes"
                                    rows="3"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5FAFB8]"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-[#5FAFB8] text-[#1e293b] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#5FAFB8]/20"
                            >
                                {editingLead ? 'Guardar Cambios' : 'Crear Lead'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
