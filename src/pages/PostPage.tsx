import { useState } from 'react';
import { ArrowLeft, Camera, Check, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { MAIN_CATEGORIES } from './HomePage';
import { useAuth } from '../contexts/AuthContext';
import { createProfessional } from '../services/professionals';

type Step = 1 | 2 | 3;

// Suggested tags per category for quick-add
const TAG_SUGGESTIONS: Record<string, string[]> = {
    servicio: ['Limpieza general', 'Limpieza de oficinas', 'Niñera', 'Cuidado de adultos mayores', 'Flete', 'Mudanza', 'Lavado de autos', 'Paseador de perros'],
    tecnico: ['Instalación de aire acondicionado', 'Reparación de PC', 'Reparación de celulares', 'Sonido e iluminación', 'Cámaras de seguridad', 'Redes Wi-Fi', 'Reparación de electrodomésticos'],
    profesional: ['Derecho laboral', 'Derecho civil', 'Diseño de planos', 'Fotografía de eventos', 'Contabilidad', 'Marketing digital', 'Clases particulares', 'Traducción'],
    oficio: ['Corte de césped', 'Poda de cercos', 'Limpieza de terrenos', 'Riego automático', 'Pintura interior', 'Pintura exterior', 'Instalación eléctrica', 'Destape de cañerías', 'Colocación de cerámicos', 'Construcción en seco (Durlock)', 'Soldadura', 'Carpintería a medida'],
};

const PROFESSIONS_LIST = [
"Abogado Corporativo y Mercantil", "Abogado Penalista", "Actuario", "Analista de Datos en la Empresa (Business Analytics)", "Animador 3D / Artista de Efectos Visuales (CGI)", "Antropólogo (Social y Físico)", "Arqueólogo de Campo", "Arquitecto Paisajista", "Arquitecto Urbanista", "Astrónomo / Astrofísico Observacional", "Bacteriólogo Especialista", "Bioeticista Clínico", "Biólogo Marino", "Biólogo Molecular y Celular", "Botánico / Fisiólogo Vegetal", "Bromatólogo Clínico e Industrial", "Chef Ejecutivo / Licenciado en Artes Culinarias", "Climatólogo / Meteorólogo Dinámico", "Consultor Financiero / Wealth Manager", "Consultor en Sostenibilidad Estratégica", "Contador Público Autorizado", "Controlador de Tráfico Aéreo", "Criminólogo Académico", "Crítico de Arte y Estética", "Dermatólogo", "Diplomático de Carrera", "Director Documentalista", "Director Teatral y de Puesta en Escena", "Director de Recursos Humanos (CHRO)", "Diseñador Gráfico Senior", "Diseñador Industrial y de Producto", "Ecólogo de Sistemas", "Economista Macro/Micro", "Economista de la Salud", "Editor Literario / Corrector de Estilo y Ortotipografía", "Educador / Licenciado en Pedagogía", "Epidemiólogo", "Especialista en Administración de Negocios Digitales", "Especialista en Calidad en la Salud", "Especialista en Ecología y Biodiversidad", "Especialista en Investigación de Servicios", "Especialista en Propiedad Intelectual", "Especialista en Relaciones Públicas Institucionales", "Especialista en Óptica Cuántica y Fotónica", "Estadístico Aplicado / Biométrico", "Farmacéutico Clínico", "Filólogo / Lingüista", "Fiscal / Ministerio Público", "Fisioterapeuta / Kinesiólogo", "Físico Médico Clínico", "Físico Teórico", "Físico de Partículas Experimentales", "Físico-químico", "Fotógrafo Profesional de Estudio / Fotoperiodista", "Genetista Médico", "Geofísico", "Geógrafo Analítico Espacial", "Geólogo Estructural", "Geoquímico", "Geriatra", "Gestor Cultural y de Políticas Públicas", "Gestor de Proyectos Senior (Certificación PMP)", "Historiador", "Ingeniero Aeroespacial / Aeronáutico", "Ingeniero Agrónomo", "Ingeniero Alimentario", "Ingeniero Ambiental / Sanitario", "Ingeniero Civil", "Ingeniero Electromecánico", "Ingeniero Electrónico", "Ingeniero Estructural Especialista", "Ingeniero Forestal", "Ingeniero Industrial", "Ingeniero Mecánico", "Ingeniero Naval y Oceánico", "Ingeniero de Inteligencia Artificial", "Ingeniero de Procesos Químicos Industriales", "Ingeniero de Recursos Minerales", "Ingeniero de Sistemas Audiovisuales", "Ingeniero de Sistemas Biológicos", "Ingeniero de Sistemas de Información", "Ingeniero en Computación Teórica", "Ingeniero en Robótica y Automática", "Ingeniero en Satélites / Órbita", "Ingeniero en Seguridad Aeronáutica", "Ingeniero de la Construcción", "Inmunólogo", "Investigador Pedagógico / Científico de la Educación", "Investigador de Fibras y Polímeros", "Jefe / Oficial de Máquinas Marinas", "Juez / Magistrado", "Licenciado en Administración de Empresas", "Licenciado en Administración y Gestión Pública", "Licenciado en Bibliotecología y Ciencias de la Información", "Licenciado en Ciencias Hídricas Aplicadas", "Licenciado en Comercio Internacional", "Licenciado en Diseño de Interiores", "Licenciado en Diseño de Moda e Indumentaria", "Licenciado en Educación Especial / Inclusiva", "Licenciado en Logística y Transporte", "Licenciado en Marketing / Mercadotecnia", "Licenciado en Organización Industrial", "Licenciado en Relaciones Industriales", "Licenciado en Restauración y Conservación de Patrimonio", "Licenciado en Salud Pública", "Licenciado en Trabajo Social", "Literato / Escritor de Ficción y Ensayo", "Logopeda / Terapeuta de Lenguaje", "Matemático Aplicado e Industrial", "Matemático Puro", "Mediador / Conciliador de Conflictos", "Microbiólogo Industrial / Clínico", "Museólogo / Curador General", "Músico Académico / Director de Orquesta Sinfónica", "Médico Cirujano", "Médico Especialista en Urgencias", "Médico Internista", "Neurocientífico Cognitivo y Molecular", "Notario / Escribano Público", "Nutriólogo / Dietista Clínico", "Oceanógrafo Físico y Biológico", "Odontólogo", "Optometrista", "Paleontólogo de Vertebrados/Invertebrados", "Pediatra", "Periodista de Investigación", "Piloto de Aviación Comercial", "Planificador Integral de Eventos Profesionales", "Politólogo", "Productor Ejecutivo Cinematográfico", "Promotor y Marchante de Arte Contemporáneo", "Psicólogo Clínico", "Psiquiatra", "Químico Farmacobiólogo", "Químico Forense", "Químico Orgánico", "Químico Puro / Investigador", "Redactor Creativo (Copywriter Publicitario)", "Sismólogo Analítico", "Sociólogo", "Teólogo / Científico de las Religiones", "Terapeuta Ocupacional", "Topólogo", "Traductor Profesional / Intérprete Simultáneo", "Traumatólogo y Ortopedista", "Urbanista", "Veterinario", "Vulcanólogo"
];

const SERVICES_LIST = [
"Academia y Clases de Idiomas \"In-Company\"", "Agencia de Marketing y Publicidad B2B", "Agencia de Traducción Profesional y Localización", "Agencia de Viajes Turísticos (Intermediación Comercial)", "Agencia Matrimonial y Servicios de Citas Asistidas", "Agencia Proveedora de Azafatas y Personal de Promoción", "Alojamiento de Turismo Rural Integral", "Alquiler de Barcos, Yates y Veleros (Chárter Náutico)", "Alquiler de Equipamiento Médico y Ortopédico Doméstico", "Alquiler de Indumentaria Fina y Disfraces", "Alquiler de Oficinas Efímeras Flexibles (Coworking Space)", "Alquiler de Vehículos Compartidos y Movilidad Urbana (Carsharing)", "Animación Sociodeportiva y Entretenimiento Infantil", "Asesoría en Prevención de Riesgos Laborales (PRL)", "Asesoría Integral de Imagen y Personal Shopper", "Asesoría y Corretaje Inmobiliario Comercial (B2B)", "Asistencia Tecnológica y Configuración de Sistemas a Domicilio", "Asistencia y Chofer para Traslados Urbanos Especiales", "Asistente Personal de Higiene y Confort", "Auditoría Externa de Calidad (Normas ISO)", "Autoservicio de Lavandería (Laundromat)", "Bar de Tapas y Cantinas Tradicionales", "Barbería Clásica y Peluquería de Diseño", "Boutique Especializada de Lencería Fina y Corsetería", "Cafetería de Especialidad", "Centro de Bronceado y Fototerapia", "Centro de Impresión Gráfica y Plotter Comercial", "Centro de Juegos, Entretenimiento y Ocio Infantil de Interior", "Centro Integral de Copiado, Plastificado y Gestiones", "Centro Integral de Estética y Cosmiatría", "Cerrajería Automotriz y Residencial de Urgencia 24h", "Cervecería Artesanal (Brewpub)", "Clases de Ajedrez Competitivo", "Clases de Ballet Clásico y Danza Contemporánea", "Clases de Instrumentos Musicales y Lenguaje Musical", "Clases Guiadas de Yoga, Mindfulness y Pilates", "Clases Particulares y Tutorías de Idiomas (B2C)", "Clases Regulares de Artes Marciales y Defensa Personal", "Clases y Guías de Escalada y Montañismo", "Clínica Veterinaria de Especialidades y Urgencias", "Coaching de Vida (Life Coaching) y Desarrollo Personal", "Comprador Personal de Víveres (Mandados)", "Consultoría en Ciberseguridad y Pentesting", "Consultoría en Telecomunicaciones y Redes", "Consultoría Financiera y Reestructuración para PYMES", "Consultoría Nutricional y Seguimiento Online", "Consultoría y Auditoría Legal Empresarial", "Control y Erradicación de Plagas Urbanas", "Correduría / Broker de Seguros Corporativos", "Creación de Contenidos Digitales y Redacción SEO (Copywriting)", "Cuidador Asistencial de Personas Mayores", "Cuidador Temporal de Mascotas (Pet Sitting)", "Cuidado, Riego y Mantenimiento de Plantas de Interior", "Cursos de Buceo y Submarinismo (Certificación PADI/SSI)", "Desarrollo y Fábrica de Software a Medida", "Desinfección Anti-Patógenos de Superficies Clínicas/Caseras", "Despacho y Comercio de Panadería / Repostería", "Destrucción Segura y Confidencial de Documentos", "Diseño, Montaje y Desmontaje de Escaparatismo", "Entrenamiento Físico Personal (Personal Trainer)", "Establecimientos de Comida Rápida (Fast Food)", "Estilismo Canino Profesional (Peluquería de mascotas)", "Estudio de Tatuaje Artístico y Modificación Corporal", "Externalización Integral de Recursos Humanos (BPO)", "Floristería Comercial y Diseño Floral", "Fotografía de Retrato, Eventos Familiares y Social", "Gestión de Alquiler Vacacional y Propiedades (Airbnb Management)", "Gestión de Identidad Digital (Community Management)", "Gestión y Delegación de Trámites Burocráticos (Gestoría Administrativa)", "Gestión y Transporte de Residuos Especiales o Peligrosos", "Guardamuebles y Mini-Almacenes de Auto-Almacenaje (Self-Storage)", "Guardería de Día y Estimulación Temprana", "Guía Turístico Local e Interpretación del Patrimonio", "Heladería Artesanal y de Autor", "Hotelería, Motelería y Alojamiento Temporal", "Jardinero Paisajista Residencial", "Lavadero Automático de Vehículos (Carwash Comercial)", "Lavadero de Autos a Domicilio (Detailing)", "Limpieza General y Profunda del Hogar", "Limpieza Integral y Mantenimiento de Oficinas", "Limpieza Profesional de Cristales y Ventanales", "Limpieza Profunda de Alfombras y Tapicería Fija", "Limpieza Técnica de Ductos de Aire Acondicionado", "Locutorio Telefónico, Cybercafé y Envíos de Dinero", "Logística de Última Milla y Distribución Capilar", "Mantenimiento Completo de Piscinas", "Mantenimiento Móvil de Flotas Automotrices Comerciales", "Mantenimiento Preventivo de Maquinaria Fija e Instalaciones", "Maquillaje Profesional y Estilismo (Make-Up Artist)", "Masajes Terapéuticos, Deportivos y Relajantes", "Mensajería Urgente en Bicicleta Ecológica (Ciclomensajería)", "Mercado Cultural, Feria de Artesanos y Venta de Arte", "Micro-Reparación de Dispositivos Móviles (Smartphones)", "Niñera / Cuidado Infantil Domiciliario (Babysitter)", "Operación y Venta de Máquinas Expendedoras (Vending)", "Óptica Comercial y Adaptación de Lentes", "Organización Integral de Bodas (Wedding Planner)", "Organización Logística de Convenciones y Congresos", "Organización y Optimización de Espacios (Home Organizer)", "Parquero / Acomodador de Vehículos Privado", "Paseador de Perros (Dog Walker)", "Personalización de Regalos y Artículos Promocionales", "Pizzería y Restaurante Italiano", "Preparación de Comidas Planificadas a Domicilio (Batch Cooking)", "Producción, Impresión y Venta de Cuentos Personalizados", "Puesta a Punto y Purga de Calentadores de Agua", "Refuerzo Escolar y Académico (Tutorías Privadas)", "Reparación de Calzado, Peletería y Renovadora", "Reparación de Computadoras y Componentes Informáticos", "Reparaciones Domésticas Rápidas (Servicio de Manitas)", "Residencia de Tercera Edad e Instituciones de Larga Estadía", "Restaurante Temático o de Alta Cocina (Fine Dining)", "Retiro Logístico de Escombros y Enseres Voluminosos", "Retiro y Manejo Privado de Basura y Reciclaje", "Revelado Rápido e Impresión Fotográfica Comercial", "Servicio de Acampada Regulada (Camping o Glamping)", "Servicio de Acompañamiento Gestacional (Doula)", "Servicio de Catering y Hospitalidad Corporativa", "Servicio de Chofer Privado a Demanda", "Servicio de Cocina Oculta (Dark Kitchen / Ghost Kitchen)", "Servicio de Fisioterapia y Rehabilitación a Domicilio", "Servicio de Moto-Grúa, Remolque y Asistencia Vial", "Servicio de Planchado Profesional a Domicilio", "Servicio de Telemarketing, Promociones y Encuestas", "Servicio Doméstico Residente (Interno)", "Servicio Integral de Limpieza y Restauración de Fachadas", "Servicios Contables Externos (Outsourcing Fiscal)", "Servicios de Migración a Cloud Computing", "Servicios de Tele-Secretariado y Asistencia Virtual", "Servicios Funerarios y Pompas Fúnebres", "Servicios Gestionados de Soporte IT (Mesa de Ayuda / Helpdesk)", "Servicios Integrales de Mudanza y Fletes", "Servicios Parafinancieros Rápidos y Casas de Empeño", "Servicios Privados de Custodia y Seguridad Física", "Supervisión de Protección Cognitiva (Vigilia)", "Sustitución Preventiva de Filtros y Mallas HVAC", "Taller Comercial de Encuadernación y Fotocopiado", "Taller Comercial de Reparación de Relojes y Joyas", "Taller de Automóviles y Mecánica Rápida (Servicentro)", "Taller de Restauración Comercial de Muebles", "Terapia Psicológica y Counseling a Domicilio/Online", "Tercerización de Call Center y Atención al Cliente", "Tiendas de Conveniencia o Estaciones de Servicio", "Tintorería Rápida Comercial", "Transporte Interurbano Terrestre Comercial de Pasajeros", "Venta de Animales Domésticos, Acuarios y Accesorios (Pet Shop)", "Venta de Indumentaria a Medida (Sastrería y Camisería)", "Venta de Indumentaria Comercial de Tallas Especiales", "Venta Minorista de Alimentos Ecológicos y Herbolarios", "Vinoteca, Sala de Catas y Comercialización de Licores Premium"
];

export function PostPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);

    // Form State
    const [category, setCategory] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [subcategory, setSubcategory] = useState('');
    const [customSubcategory, setCustomSubcategory] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const { user } = useAuth();
    
    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed || tags.includes(trimmed)) return;
        setTags(prev => [...prev, trimmed]);
        setNewTag('');
    };

    const removeTag = (tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    };

    const nextStep = () => {
        if (step === 1 && !category) return;
        if (step === 2) {
            if (!subcategory) return;
            if (subcategory === 'otro' && !customSubcategory.trim()) return;
            if (!title || !description || !location || !name || !whatsapp) return;
        }
        setStep((prev) => (prev + 1) as Step);
    };

    const prevStep = () => {
        if (step === 1) navigate(-1);
        else setStep((prev) => (prev - 1) as Step);
    };

    const handlePublish = async () => {
        if (!user) {
            alert('Por favor decarga la App e inicia sesión para poder crear tu perfil profesional.');
            return;
        }

        setIsPublishing(true);
        try {
            const finalTrade = subcategory === 'otro' ? customSubcategory : subcategory;
            const fullDescription = `${title}\n\n${description}`;

            await createProfessional({
                profile_id: user.id,
                trade: finalTrade,
                description: fullDescription,
                skills: tags,
                lat: -38.7183, // default Bahía Blanca
                lng: -62.2663,
                status: location || 'Disponible'
            });

            alert('¡Tu perfil profesional fue publicado con éxito!');
            navigate('/');
        } catch (error) {
            console.error('Error al publicar:', error);
            alert('Hubo un inconveniente al publicar, intenta nuevamente!');
        } finally {
            setIsPublishing(false);
        }
    };

    const suggestions = category ? (TAG_SUGGESTIONS[category] || []).filter(s => !tags.includes(s)) : [];

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col pb-24">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={prevStep} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={22} className="text-slate-800" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Publicar anuncio</h1>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className={clsx("h-1 rounded-full", step >= 1 ? "bg-emerald-500" : "bg-slate-200")} />
                        <span className={clsx("text-[10px] text-center font-bold", step >= 1 ? "text-slate-800" : "text-slate-400")}>Categoría</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className={clsx("h-1 rounded-full", step >= 2 ? "bg-emerald-500" : "bg-slate-200")} />
                        <span className={clsx("text-[10px] text-center font-bold", step >= 2 ? "text-slate-800" : "text-slate-400")}>Detalles</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className={clsx("h-1 rounded-full", step >= 3 ? "bg-emerald-500" : "bg-slate-200")} />
                        <span className={clsx("text-[10px] text-center font-bold", step >= 3 ? "text-slate-800" : "text-slate-400")}>Fotos</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Categoría */}
            {step === 1 && (
                <div className="p-4 flex-1">
                    <p className="text-slate-600 font-medium mb-4">¿Qué querés publicar?</p>
                    <div className="grid grid-cols-2 gap-4">
                        {MAIN_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => { setCategory(cat.id); setTags([]); }}
                                className={clsx(
                                    "bg-white rounded-2xl p-6 shadow-sm border flex flex-col items-center justify-center gap-3 transition-all",
                                    category === cat.id ? "border-emerald-400 ring-2 ring-emerald-400/20" : "border-slate-100 hover:border-emerald-200"
                                )}
                            >
                                <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md",
                                    cat.color
                                )}>
                                    <cat.icon size={26} strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-slate-700 text-sm">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={nextStep}
                            disabled={!category}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Detalles + Tags */}
            {step === 2 && (
                <div className="p-4 flex-1 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Subcategoría</label>
                        <select
                            value={subcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 text-sm appearance-none"
                        >
                            <option value="" disabled>Seleccioná una subcategoría...</option>
                            {category === 'profesional' ? (
                                <>
                                    {PROFESSIONS_LIST.map(prof => (
                                        <option key={prof} value={prof}>{prof}</option>
                                    ))}
                                </>
                            ) : category === 'servicio' ? (
                                <>
                                    {SERVICES_LIST.map(serv => (
                                        <option key={serv} value={serv}>{serv}</option>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <option value="plomeria">Plomería</option>
                                    <option value="electricidad">Electricidad</option>
                                    <option value="gas">Gas</option>
                                    <option value="jardineria">Jardinería</option>
                                    <option value="limpieza">Limpieza</option>
                                    <option value="construccion">Construcción</option>
                                </>
                            )}
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    {subcategory === 'otro' && (
                        <div>
                            <label className="block text-sm font-bold text-slate-900 mb-2">Especificá tu subcategoría</label>
                            <input
                                type="text"
                                value={customSubcategory}
                                onChange={(e) => setCustomSubcategory(e.target.value)}
                                placeholder="Ej: Especialista en..."
                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 text-sm"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Gasista matriculado, Médico pediatra..."
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describí tus servicios, años de experiencia, zonas de cobertura..."
                            rows={4}
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 text-sm resize-none"
                        />
                    </div>

                    {/* Tags Section */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                            Actividades / Tags <span className="text-slate-400 font-normal text-xs">({tags.length})</span>
                        </label>
                        <p className="text-xs text-slate-500 mb-3">Agregá tags para que los clientes te encuentren más fácil al buscar.</p>

                        {/* Current Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="text-emerald-400 hover:text-red-500 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Add Tag Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                                placeholder="Ej: Corte de césped, Poda de cercos..."
                                className="flex-1 bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 text-sm"
                            />
                            <button
                                onClick={() => addTag(newTag)}
                                disabled={!newTag.trim()}
                                className={clsx(
                                    "p-3 rounded-xl transition-all",
                                    newTag.trim()
                                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md"
                                        : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                )}
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Tag Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="mt-3">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2">Sugerencias</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {suggestions.slice(0, 8).map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => addTag(tag)}
                                            className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors flex items-center gap-1"
                                        >
                                            <Plus size={10} />
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Localidad</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ej: San Martín de los Andes"
                            className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Datos de contacto</label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre"
                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 text-sm"
                            />
                            <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="WhatsApp (ej: 5491112345678)"
                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 text-sm"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email (opcional)"
                                className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-400 text-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={prevStep}
                            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 py-3.5 rounded-xl font-bold transition-colors uppercase tracking-wide"
                        >
                            Atrás
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={!subcategory || (subcategory === 'otro' && !customSubcategory.trim()) || !title || !description || !location || !name || !whatsapp}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Fotos & Resumen */}
            {step === 3 && (
                <div className="p-4 flex-1 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Fotos (0/5)</label>
                        <button className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors text-slate-500">
                            <Camera size={24} />
                            <span className="text-xs font-bold">Agregar</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-3 text-sm">Resumen</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-slate-500 font-medium">Categoría:</span> {MAIN_CATEGORIES.find(c => c.id === category)?.label}</p>
                            <p><span className="text-slate-500 font-medium">Subcategoría:</span> <span className="capitalize">{subcategory}</span></p>
                            <p><span className="text-slate-500 font-medium">Título:</span> {title}</p>
                            <p><span className="text-slate-500 font-medium">Localidad:</span> {location}</p>
                            {tags.length > 0 && (
                                <div>
                                    <span className="text-slate-500 font-medium">Tags:</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {tags.map(tag => (
                                            <span key={tag} className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-1 rounded-md border border-emerald-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={prevStep}
                            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} /> Atrás
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-emerald-500/20 shadow-lg disabled:opacity-50"
                        >
                            {isPublishing ? (
                                'Publicando...'
                            ) : (
                                <>
                                    <Check size={18} strokeWidth={3} /> Publicar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
