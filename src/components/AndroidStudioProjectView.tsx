import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Download,
  Copy,
  Check,
  Smartphone,
  Terminal,
  BookOpen,
  Code2,
  Layers,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_FILES, AndroidSourceFile } from '../android_source/androidCodebase';
import { AppSettings } from '../types';
import { translations } from '../i18n/translations';
import { themes } from '../theme/themes';

interface Props {
  settings: AppSettings;
}

export const AndroidStudioProjectView: React.FC<Props> = ({ settings }) => {
  const t = translations[settings.language];
  const currentTheme = themes[settings.theme] || themes.black_gold;

  const [selectedFile, setSelectedFile] = useState<AndroidSourceFile>(ANDROID_FILES[4]); // default to DatabaseHelper.java
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();
      const rootFolder = zip.folder('SAQIB-Belt-Business-Android');

      // Add each file to the zip archive preserving directory paths
      ANDROID_FILES.forEach((file) => {
        rootFolder?.file(file.path, file.content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SAQIB_Belt_Business_Android_Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setDownloading(false);
    }
  };

  const filteredFiles = ANDROID_FILES.filter(
    (f) => activeCategory === 'all' || f.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-brand">
              Android Studio Project &amp; Source Code
            </h2>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              Java + SQLite + XML
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Production-ready Android project ready to open in Android Studio and compile into an installable APK
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Packing Zip...' : t.downloadZip}</span>
        </button>
      </div>

      {/* Guide Banner */}
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-200/90 flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-300 font-bold">Ready for APK Build:</strong>{' '}
          Click the download button above to get the full Android Studio project as a zip file.
          Extract the zip, open it in <strong>Android Studio</strong>, and click <strong>Build &rarr; Build APK(s)</strong> or run <code>./gradlew assembleDebug</code> in the terminal to generate <code>app-debug.apk</code> for your phone!
        </div>
      </div>

      {/* File Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-amber-500 text-neutral-950'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          All Files ({ANDROID_FILES.length})
        </button>
        <button
          onClick={() => setActiveCategory('java')}
          className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer whitespace-nowrap ${
            activeCategory === 'java'
              ? 'bg-amber-500 text-neutral-950'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          Java Classes (SQLite &amp; Logic)
        </button>
        <button
          onClick={() => setActiveCategory('xml_layout')}
          className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer whitespace-nowrap ${
            activeCategory === 'xml_layout'
              ? 'bg-amber-500 text-neutral-950'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          XML Layouts
        </button>
        <button
          onClick={() => setActiveCategory('gradle')}
          className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer whitespace-nowrap ${
            activeCategory === 'gradle'
              ? 'bg-amber-500 text-neutral-950'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          Gradle Build Scripts
        </button>
        <button
          onClick={() => setActiveCategory('manifest')}
          className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer whitespace-nowrap ${
            activeCategory === 'manifest'
              ? 'bg-amber-500 text-neutral-950'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          AndroidManifest
        </button>
        <button
          onClick={() => setActiveCategory('docs')}
          className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer whitespace-nowrap ${
            activeCategory === 'docs'
              ? 'bg-amber-500 text-neutral-950'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          APK Build Guide
        </button>
      </div>

      {/* Code Browser Layout: Left Tree & Right Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Project File Tree (4 cols) */}
        <div className={`lg:col-span-4 p-3 rounded-2xl border ${currentTheme.cardBorder} ${currentTheme.cardBg} shadow-sm space-y-1.5 max-h-[650px] overflow-y-auto`}>
          <div className="px-3 py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Project Explorer</span>
            <span className="font-mono text-amber-400">{filteredFiles.length} items</span>
          </div>

          {filteredFiles.map((f) => {
            const isSelected = selectedFile.path === f.path;
            return (
              <button
                key={f.path}
                onClick={() => setSelectedFile(f)}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 border border-transparent'
                }`}
              >
                <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs truncate font-mono">{f.path}</div>
                  <div className="text-[10px] text-neutral-500 truncate">{f.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Code Viewer & Copy (8 cols) */}
        <div className={`lg:col-span-8 rounded-2xl border ${currentTheme.cardBorder} bg-neutral-950 shadow-xl overflow-hidden flex flex-col`}>
          {/* Top Bar */}
          <div className="px-4 py-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-neutral-300 font-semibold">{selectedFile.path}</span>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="p-4 overflow-x-auto max-h-[600px] text-xs font-mono text-neutral-200 leading-relaxed bg-neutral-950">
            <pre className="whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
