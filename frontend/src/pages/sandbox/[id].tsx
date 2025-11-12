import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { sandboxesAPI } from '../../lib/api';
import {
  Play,
  Save,
  Share2,
  Users,
  FileText,
  FolderPlus,
  Trash2,
  Download,
  Camera,
  Settings,
} from 'lucide-react';

// Dynamically import Monaco Editor with no SSR
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface SandboxFile {
  content: string;
  type: string;
  updated_at?: string;
}

interface SandboxFiles {
  [key: string]: SandboxFile;
}

interface Sandbox {
  id: number;
  name: string;
  description: string;
  language: string;
  status: string;
  files: SandboxFiles;
  owner_id: number;
  shared_with: number[];
  last_output: string;
  last_error: string;
  total_executions: number;
  created_at: string;
}

interface Collaborator {
  id: number;
  user_id: number;
  is_typing: boolean;
  cursor_position: any;
}

export default function SandboxPage() {
  const router = useRouter();
  const { id } = router.query;

  const [sandbox, setSandbox] = useState<Sandbox | null>(null);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);

  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<any>(null);
  const fitAddon = useRef<any>(null);

  // Initialize terminal (client-side only)
  useEffect(() => {
    if (!terminalRef.current || terminalInstance.current || typeof window === 'undefined') return;

    // Dynamically import xterm on client side only
    import('xterm').then(({ Terminal }) => {
      import('xterm-addon-fit').then(({ FitAddon }) => {
        // Also import CSS
        import('xterm/css/xterm.css');

        const terminal = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4',
          },
          convertEol: true,
          rows: 15,
        });

        const fit = new FitAddon();
        terminal.loadAddon(fit);

        terminal.open(terminalRef.current!);
        fit.fit();

        terminal.writeln('Welcome to Relaywork Sandbox Terminal');
        terminal.writeln('Run your code to see output here...');
        terminal.writeln('');

        terminalInstance.current = terminal;
        fitAddon.current = fit;

        // Resize on window resize
        const handleResize = () => {
          if (fitAddon.current) {
            fitAddon.current.fit();
          }
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          terminal.dispose();
        };
      });
    });
  }, []);

  // Load sandbox
  useEffect(() => {
    if (!id) return;

    const loadSandbox = async () => {
      try {
        const response = await sandboxesAPI.getById(Number(id));
        const sandboxData = response.data;
        setSandbox(sandboxData);

        // Load first file
        const files = Object.keys(sandboxData.files);
        if (files.length > 0) {
          const firstFile = files[0];
          setCurrentFile(firstFile);
          setCode(sandboxData.files[firstFile].content || '');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading sandbox:', error);
        setLoading(false);
      }
    };

    loadSandbox();
  }, [id]);

  // WebSocket connection
  useEffect(() => {
    if (!id || !sandbox) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const wsUrl = `ws://localhost:8000/api/v1/sandboxes/${id}/ws?token=${token}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'user_joined' || data.type === 'user_left') {
        // Reload collaborators
        loadCollaborators();
      } else if (data.type === 'file_changed') {
        // Reload sandbox data
        reloadSandbox();
      } else if (data.type === 'cursor_update') {
        // Handle cursor updates (for future enhancement)
        console.log('Cursor update:', data);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(websocket);

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [id, sandbox]);

  const loadCollaborators = async () => {
    if (!id) return;
    try {
      const response = await sandboxesAPI.getCollaborators(Number(id));
      setCollaborators(response.data);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const reloadSandbox = async () => {
    if (!id) return;
    try {
      const response = await sandboxesAPI.getById(Number(id));
      setSandbox(response.data);
    } catch (error) {
      console.error('Error reloading sandbox:', error);
    }
  };

  const handleFileSelect = (fileName: string) => {
    if (!sandbox) return;

    // Save current file first
    if (currentFile && code !== sandbox.files[currentFile]?.content) {
      saveFile();
    }

    setCurrentFile(fileName);
    setCode(sandbox.files[fileName]?.content || '');
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');

    // Notify typing via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'typing',
        is_typing: true,
        file: currentFile,
      }));
    }
  };

  const saveFile = async () => {
    if (!id || !currentFile || !sandbox) return;

    try {
      const response = await sandboxesAPI.manageFile(Number(id), {
        operation: 'update',
        file_path: currentFile,
        content: code,
      });

      setSandbox(response.data);

      // Notify file change via WebSocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'file_change',
          file_path: currentFile,
        }));
      }

      if (terminalInstance.current) {
        terminalInstance.current.writeln(`✓ Saved ${currentFile}`);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      if (terminalInstance.current) {
        terminalInstance.current.writeln(`✗ Error saving ${currentFile}`);
      }
    }
  };

  const runCode = async () => {
    if (!id || !currentFile) return;

    setIsExecuting(true);

    // Save file first
    await saveFile();

    try {
      // Notify execution start
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'execution_started',
          file_path: currentFile,
        }));
      }

      if (terminalInstance.current) {
        terminalInstance.current.clear();
        terminalInstance.current.writeln(`Running ${currentFile}...`);
        terminalInstance.current.writeln('');
      }

      const response = await sandboxesAPI.execute(Number(id), {
        file_path: currentFile,
        timeout: 30,
      });

      const result = response.data;

      if (terminalInstance.current) {
        if (result.success) {
          terminalInstance.current.writeln('✓ Execution successful');
          terminalInstance.current.writeln('');
          terminalInstance.current.writeln(result.output || '(no output)');
        } else {
          terminalInstance.current.writeln('✗ Execution failed');
          terminalInstance.current.writeln('');
          if (result.error) {
            terminalInstance.current.writeln(result.error);
          }
        }
        terminalInstance.current.writeln('');
        terminalInstance.current.writeln(`Completed in ${result.duration_ms}ms`);
      }

      // Notify execution completed
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'execution_completed',
          success: result.success,
        }));
      }
    } catch (error: any) {
      console.error('Error executing code:', error);
      if (terminalInstance.current) {
        terminalInstance.current.writeln('✗ Error executing code');
        terminalInstance.current.writeln(error.response?.data?.detail || error.message);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const createNewFile = async () => {
    if (!id || !newFileName || !sandbox) return;

    try {
      const response = await sandboxesAPI.manageFile(Number(id), {
        operation: 'create',
        file_path: newFileName,
        content: '',
      });

      setSandbox(response.data);
      setCurrentFile(newFileName);
      setCode('');
      setShowFileDialog(false);
      setNewFileName('');

      if (terminalInstance.current) {
        terminalInstance.current.writeln(`✓ Created ${newFileName}`);
      }
    } catch (error) {
      console.error('Error creating file:', error);
    }
  };

  const deleteFile = async (fileName: string) => {
    if (!id || !confirm(`Delete ${fileName}?`)) return;

    try {
      const response = await sandboxesAPI.manageFile(Number(id), {
        operation: 'delete',
        file_path: fileName,
      });

      setSandbox(response.data);

      // Select another file
      const files = Object.keys(response.data.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      } else {
        setCurrentFile('');
        setCode('');
      }

      if (terminalInstance.current) {
        terminalInstance.current.writeln(`✓ Deleted ${fileName}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const getLanguageForEditor = (lang: string) => {
    const mapping: { [key: string]: string } = {
      python: 'python',
      javascript: 'javascript',
      typescript: 'typescript',
    };
    return mapping[lang] || 'plaintext';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading sandbox...</div>
      </div>
    );
  }

  if (!sandbox) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center">
        <div className="text-white text-xl">Sandbox not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{sandbox.name}</h1>
            <p className="text-gray-400 text-sm">{sandbox.description}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Collaborators */}
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">{collaborators.length + 1} online</span>
            </div>

            {/* Actions */}
            <button
              onClick={saveFile}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>

            <button
              onClick={runCode}
              disabled={isExecuting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isExecuting ? 'Running...' : 'Run'}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File Explorer */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold">Files</h2>
            <button
              onClick={() => setShowFileDialog(true)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {Object.keys(sandbox.files).map((fileName) => (
              <div
                key={fileName}
                className={`group flex items-center justify-between p-2 rounded cursor-pointer ${
                  currentFile === fileName
                    ? 'bg-blue-600'
                    : 'hover:bg-gray-700'
                }`}
                onClick={() => handleFileSelect(fileName)}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{fileName}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(fileName);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor and Terminal */}
        <div className="flex-1 flex flex-col">
          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={getLanguageForEditor(sandbox.language)}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                rulers: [80],
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Terminal */}
          <div className="h-64 bg-gray-900 border-t border-gray-700">
            <div className="h-full p-2">
              <div ref={terminalRef} className="h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* New File Dialog */}
      {showFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Create New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="File name (e.g., script.py)"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createNewFile()}
            />
            <div className="flex gap-2">
              <button
                onClick={createNewFile}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowFileDialog(false);
                  setNewFileName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
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
