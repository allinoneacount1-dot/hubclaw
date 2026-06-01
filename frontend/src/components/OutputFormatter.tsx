import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExportFormat } from '../services/api';
import { Copy, Download, Check, FileText, Code, Table, File } from 'lucide-react';

interface OutputFormatterProps {
  content: string;
  format?: ExportFormat;
  onFormatChange?: (format: ExportFormat) => void;
  className?: string;
}

const formats: { id: ExportFormat; label: string; icon: typeof FileText }[] = [
  { id: 'markdown', label: 'Markdown', icon: FileText },
  { id: 'json', label: 'JSON', icon: Code },
  { id: 'csv', label: 'CSV', icon: Table },
  { id: 'txt', label: 'Plain Text', icon: File },
];

function formatAs(content: string, format: ExportFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify({ content, exported_at: new Date().toISOString() }, null, 2);
    case 'csv':
      const lines = content.split('\n').map(l => `"${l.replace(/"/g, '""')}"`).join('\n');
      return `content\n${lines}`;
    case 'markdown':
      return content;
    case 'txt':
      return content.replace(/[*#`~>\[\]]/g, '').replace(/\n{3,}/g, '\n\n');
    default:
      return content;
  }
}

function downloadFile(content: string, format: ExportFormat) {
  const mimeTypes: Record<ExportFormat, string> = {
    markdown: 'text/markdown',
    json: 'application/json',
    csv: 'text/csv',
    txt: 'text/plain',
  };
  const extensions: Record<ExportFormat, string> = {
    markdown: 'md',
    json: 'json',
    csv: 'csv',
    txt: 'txt',
  };
  const blob = new Blob([content], { type: mimeTypes[format] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `output.${extensions[format]}`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OutputFormatter({ content, format = 'markdown', onFormatChange, className }: OutputFormatterProps) {
  const [currentFormat, setCurrentFormat] = useState<ExportFormat>(format);
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatAs(content, currentFormat));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(formatAs(content, currentFormat), currentFormat);
  };

  if (!content) return null;

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded bg-slate-800/30 text-slate-500 hover:text-cyan-400 border border-slate-800/30 hover:border-cyan-400/20 transition-all"
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => setShowExport(!showExport)}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded border transition-all ${
            showExport
              ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
              : 'bg-slate-800/30 text-slate-500 hover:text-cyan-400 border-slate-800/30 hover:border-cyan-400/20'
          }`}
        >
          <Download size={10} />
          Export
        </button>
      </div>

      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 rounded-md bg-slate-900/50 border border-slate-800/30"
          >
            <div className="flex gap-1.5">
              {formats.map(f => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => { setCurrentFormat(f.id); onFormatChange?.(f.id); }}
                    className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded transition-all ${
                      currentFormat === f.id
                        ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/20'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    <Icon size={10} />
                    {f.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleDownload}
              className="ml-auto flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded hover:bg-cyan-400/20 transition-all"
            >
              <Download size={10} />
              Download .{currentFormat === 'markdown' ? 'md' : currentFormat === 'txt' ? 'txt' : currentFormat}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { formatAs, downloadFile };
