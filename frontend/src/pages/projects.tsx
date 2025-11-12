import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/authStore';
import Head from 'next/head';
import {
  Globe2, Search, Filter, Briefcase, Clock, DollarSign,
  MapPin, Calendar, TrendingUp, Star, BadgeCheck, ArrowRight
} from 'lucide-react';
import axios from 'axios';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  status: string;
  required_skills: string[];
  created_at: string;
  owner: {
    id: number;
    email: string;
    profile?: {
      first_name?: string;
      last_name?: string;
      company_name?: string;
    };
  };
}

export default function Projects() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Projects' },
    { value: 'ai_development', label: 'AI Development' },
    { value: 'automation', label: 'Automation' },
    { value: 'prompt_engineering', label: 'Prompt Engineering' },
    { value: 'ml_training', label: 'ML Training' },
    { value: 'integration', label: 'Integration' }
  ];

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params: any = { status: 'open' };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await axios.get(`${API_URL}/api/v1/projects`, { params });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'ai_development': 'bg-blue-100 text-blue-700',
      'automation': 'bg-purple-100 text-purple-700',
      'prompt_engineering': 'bg-pink-100 text-pink-700',
      'ml_training': 'bg-green-100 text-green-700',
      'integration': 'bg-orange-100 text-orange-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <Head>
        <title>Browse Projects - Remote-Works</title>
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-accent-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
                <Globe2 className="w-8 h-8 text-primary-500 mr-2" />
                <div className="text-2xl font-bold text-accent-dark">
                  Relay<span className="gradient-text">work</span>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <button onClick={() => router.push('/projects')} className="text-primary-500 font-medium">Browse Projects</button>
                {isAuthenticated ? (
                  <button onClick={() => router.push('/dashboard')} className="btn-primary">
                    Dashboard
                  </button>
                ) : (
                  <>
                    <button onClick={() => router.push('/login')} className="text-accent-gray-600 hover:text-primary-500 transition font-medium">Login</button>
                    <button onClick={() => router.push('/register')} className="btn-primary">
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-accent-dark mb-4">
                Browse AI Projects
              </h1>
              <p className="text-xl text-accent-gray-600 max-w-2xl mx-auto">
                Discover async AI projects from companies worldwide. Work on your schedule, get verified for your skills.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects by title, description, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Projects */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Filters */}
            <div className="mb-8 flex items-center space-x-4 overflow-x-auto pb-4">
              <Filter className="w-5 h-5 text-accent-gray-500 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
                    selectedCategory === category.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-accent-gray-100 text-accent-gray-700 hover:bg-accent-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-accent-gray-600">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="w-16 h-16 text-accent-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-accent-gray-700 mb-2">No projects found</h3>
                <p className="text-accent-gray-500">Try adjusting your filters or check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl border-2 border-accent-gray-200 p-6 hover:border-primary-500 hover:shadow-xl transition-all cursor-pointer card-hover"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    {/* Category Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(project.category)}`}>
                        {project.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-accent-dark mb-3 line-clamp-2">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-accent-gray-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Skills */}
                    {project.required_skills && project.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.required_skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {project.required_skills.length > 3 && (
                          <span className="px-2 py-1 bg-accent-gray-100 text-accent-gray-600 rounded text-xs font-medium">
                            +{project.required_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Project Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-accent-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-accent-gray-600">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-semibold text-accent-dark">${project.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(project.deadline)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <BadgeCheck className="w-5 h-5 text-primary-500" />
                        </div>
                        <span className="text-sm text-accent-gray-700 font-medium">
                          {project.owner?.profile?.company_name || 'Company'}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="py-16 bg-gradient-to-br from-primary-500 to-purple-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Start Working?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Sign up now to apply for projects and showcase your AI expertise.
              </p>
              <button onClick={() => router.push('/register?type=freelancer')} className="bg-white text-primary-500 px-10 py-4 rounded-lg font-bold hover:shadow-2xl transition transform hover:scale-105 text-lg">
                Join as Freelancer
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
