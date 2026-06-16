// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Users, 
    Briefcase, 
    Calendar, 
    FileText, 
    BarChart3, 
    Bell,
    Shield,
    ArrowRight,
    TrendingUp,
    Clock,
    CheckCircle
} from 'lucide-react';

const Home = () => {
    return (
        <div>
            {/* Section Héro */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mb-6">
                        <Shield className="w-4 h-4" />
                        <span>Solution interne RH</span>
                    </div>
                    
                    {/* Titre principal */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                        Gérez vos recrutements
                        <span className="text-blue-600"> simplement</span>
                    </h1>
                    
                    {/* Sous-titre */}
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Centralisez vos candidatures, suivez les entretiens et pilotez vos recrutements 
                        avec une interface simple et efficace.
                    </p>
                    
                    {/* Boutons CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link 
                            to="/register" 
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md"
                        >
                            Commencer gratuitement
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link 
                            to="/login" 
                            className="border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                        >
                            Se connecter
                        </Link>
                    </div>
                    
                    {/* Aperçu du tableau de bord */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
                        {/* Barre de titre */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <span className="text-xs text-gray-500 ml-2">Tableau de bord RH</span>
                        </div>
                        
                        {/* Contenu de l'aperçu */}
                        <div className="p-6">
                            {/* Cartes KPI */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-blue-600">124</p>
                                    <p className="text-xs text-gray-600 mt-1">Candidatures</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-green-600">12</p>
                                    <p className="text-xs text-gray-600 mt-1">Postes ouverts</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-orange-600">45</p>
                                    <p className="text-xs text-gray-600 mt-1">Entretiens</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-purple-600">67%</p>
                                    <p className="text-xs text-gray-600 mt-1">Taux conversion</p>
                                </div>
                            </div>
                            
                            {/* Légende */}
                            <div className="border-t border-gray-100 pt-4 text-center">
                                <p className="text-xs text-gray-400">Aperçu du tableau de bord - données fictives</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Section fonctionnalités */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Fonctionnalités principales</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Tout ce dont vous avez besoin pour gérer vos recrutements efficacement
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Carte 1 */}
                        <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition group">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">👥 Gestion des candidats</h3>
                            <p className="text-sm text-gray-500">Centralisez tous les profils, CV et documents des candidats.</p>
                        </div>
                        
                        {/* Carte 2 */}
                        <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition group">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                                <Briefcase className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">💼 Gestion des postes</h3>
                            <p className="text-sm text-gray-500">Créez et suivez vos fiches de poste par département.</p>
                        </div>
                        
                        {/* Carte 3 */}
                        <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition group">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition">
                                <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">📄 Suivi des candidatures</h3>
                            <p className="text-sm text-gray-500">Statuts, historique des changements, commentaires internes.</p>
                        </div>
                        
                        {/* Carte 4 */}
                        <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition group">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">📅 Planification entretiens</h3>
                            <p className="text-sm text-gray-500">Organisez et suivez vos entretiens (RH, technique, final).</p>
                        </div>
                        
                        {/* Carte 5 */}
                        <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition group">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition">
                                <BarChart3 className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">📊 Statistiques</h3>
                            <p className="text-sm text-gray-500">Analysez vos performances recrutement avec des graphiques.</p>
                        </div>
                        
                        {/* Carte 6 */}
                        <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition group">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition">
                                <Bell className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">🔔 Notifications</h3>
                            <p className="text-sm text-gray-500">Alertes en temps réel pour les changements de statut.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Section chiffres clés */}
            <section className="py-16 bg-blue-600">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div>
                            <p className="text-3xl md:text-4xl font-bold">+500</p>
                            <p className="text-sm text-blue-100 mt-2">Candidatures traitées</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-4xl font-bold">+50</p>
                            <p className="text-sm text-blue-100 mt-2">Postes pourvus</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-4xl font-bold">30j</p>
                            <p className="text-sm text-blue-100 mt-2">Délai moyen</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-4xl font-bold">100%</p>
                            <p className="text-sm text-blue-100 mt-2">Satisfaction équipe</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Section CTA finale */}
            <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        Prêt à simplifier vos recrutements ?
                    </h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Rejoignez les équipes RH qui utilisent Akanjo au quotidien.
                    </p>
                    <Link 
                        to="/register" 
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-md"
                    >
                        Créer un compte
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;