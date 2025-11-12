import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { sandboxesAPI } from '../lib/api';
import {
  Play,
  Plus,
  Code2,
  Clock,
  Users,
  Trash2,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';

interface Sandbox {
  id: number;
  name: string;
  description: string;
  language: string;
  status: string;
  owner_id: number;
  shared_with: number[];
  total_executions: number;
  created_at: string;
  last_accessed_at: string;
}

export default function SandboxesPage() {
  const router = useRouter();
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSandbox, setNewSandbox] = useState({
    name: '',
    description: '',
    language: 'python' as 'python' | 'javascript' | 'typescript',
  });

  useEffect(() => {
    loadSandboxes();
  }, []);

  const loadSandboxes = async () => {
    try {
      const response = await sandboxesAPI.getAll();
      setSandboxes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading sandboxes:', error);
      setLoading(false);
    }
  };

  const createSandbox = async () => {
    if (!newSandbox.name.trim()) {
      alert('Please enter a sandbox name');
      return;
    }

    try {
      const response = await sandboxesAPI.create({
        name: newSandbox.name,
        description: newSandbox.description,
        language: newSandbox.language,
        shared_with: [],
        files: {},
      });

      // Redirect to the new sandbox
      router.push(`/sandbox/${response.data.id}`);
    } catch (error) {
      console.error('Error creating sandbox:', error);
      alert('Failed to create sandbox');
    }
  };

  const deleteSandbox = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sandbox?')) return;

    try {
      await sandboxesAPI.delete(id);
      loadSandboxes();
    } catch (error) {
      console.error('Error deleting sandbox:', error);
      alert('Failed to delete sandbox');
    }
  };

  const getLanguageColor = (lang: string) => {
    const colors: { [key: string]: string } = {
      python: 'bg-blue-500',
      javascript: 'bg-yellow-500',
      typescript: 'bg-blue-600',
    };
    return colors[lang] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              My Sandboxes
            </h1>
            <p className="text-blue-200">
              Test and develop AI flows in isolated environments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Sandbox
            </button>
          </div>
        </div>

        {/* Sandboxes Grid */}
        {loading ? (
          <div className="text-white text-center py-12">
            Loading sandboxes...
          </div>
        ) : sandboxes.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 text-center">
            <Code2 className="w-16 h-16 mx-auto mb-4 text-blue-300" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No sandboxes yet
            </h3>
            <p className="text-blue-200 mb-6">
              Create your first sandbox to start testing AI flows
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Sandbox
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sandboxes.map((sandbox) => (
              <div
                key={sandbox.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 ${getLanguageColor(
                          sandbox.language
                        )} text-white text-xs rounded-full`}
                      >
                        {sandbox.language}
                      </span>
                      {sandbox.shared_with.length > 0 && (
                        <div className="flex items-center gap-1 text-blue-200 text-xs">
                          <Users className="w-3 h-3" />
                          {sandbox.shared_with.length}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {sandbox.name}
                    </h3>
                    <p className="text-blue-200 text-sm line-clamp-2">
                      {sandbox.description || 'No description'}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSandbox(sandbox.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-blue-200 mb-4">
                  <div className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    {sandbox.total_executions} runs
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(sandbox.last_accessed_at)}
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/sandbox/${sandbox.id}`)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  Open Sandbox
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Sandbox Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold text-white mb-6">
              Create New Sandbox
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-blue-200 mb-2">
                  Sandbox Name
                </label>
                <input
                  type="text"
                  value={newSandbox.name}
                  onChange={(e) =>
                    setNewSandbox({ ...newSandbox, name: e.target.value })
                  }
                  placeholder="My AI Project"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newSandbox.description}
                  onChange={(e) =>
                    setNewSandbox({
                      ...newSandbox,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what you're building..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-blue-200 mb-2">Language</label>
                <select
                  value={newSandbox.language}
                  onChange={(e) =>
                    setNewSandbox({
                      ...newSandbox,
                      language: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createSandbox}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewSandbox({
                    name: '',
                    description: '',
                    language: 'python',
                  });
                }}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
