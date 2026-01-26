import React, { useState } from 'react';
import { TagPill, TagInput } from '@/components/ui/TagPill';
import { MOOD_OPTIONS, MENTOR_TONE_OPTIONS } from '@/types';

const DesignSystemPage: React.FC = () => {
  const [sampleTags, setSampleTags] = useState(['work', 'meeting']);

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Design System Overview
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Reference for all design tokens, components, and patterns used in the app.
        </p>
      </header>

      {/* Color Palette */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Color Palette
        </h2>

        {/* Primary (Slate) */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Primary Colors (Slate)
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Used for backgrounds, text, borders, and general UI elements.
          </p>
          <div className="grid grid-cols-5 lg:grid-cols-11 gap-2">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
              <div key={shade} className="text-center">
                <div
                  className={`h-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-${shade}`}
                  style={{ backgroundColor: `var(--tw-slate-${shade}, rgb(var(--color-slate-${shade})))` }}
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 mt-1 block">
                  {shade}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 lg:grid-cols-11 gap-2 mt-2">
            <div className="h-12 rounded-lg bg-slate-50" />
            <div className="h-12 rounded-lg bg-slate-100" />
            <div className="h-12 rounded-lg bg-slate-200" />
            <div className="h-12 rounded-lg bg-slate-300" />
            <div className="h-12 rounded-lg bg-slate-400" />
            <div className="h-12 rounded-lg bg-slate-500" />
            <div className="h-12 rounded-lg bg-slate-600" />
            <div className="h-12 rounded-lg bg-slate-700" />
            <div className="h-12 rounded-lg bg-slate-800" />
            <div className="h-12 rounded-lg bg-slate-900" />
            <div className="h-12 rounded-lg bg-slate-950" />
          </div>
        </div>

        {/* Accent Colors */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Accent Colors
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="h-16 rounded-lg bg-blue-500 mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">Blue</p>
              <p className="text-xs text-slate-500">Interactive, links, active states</p>
            </div>
            <div>
              <div className="h-16 rounded-lg bg-green-500 mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">Green</p>
              <p className="text-xs text-slate-500">Success, online status</p>
            </div>
            <div>
              <div className="h-16 rounded-lg bg-yellow-500 mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">Yellow</p>
              <p className="text-xs text-slate-500">Warning, queued items</p>
            </div>
            <div>
              <div className="h-16 rounded-lg bg-red-500 mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">Red</p>
              <p className="text-xs text-slate-500">Error, delete, offline</p>
            </div>
          </div>
        </div>

        {/* Semantic Colors */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Semantic Usage
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 font-medium text-slate-900 dark:text-white">Element</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-900 dark:text-white">Light Mode</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-900 dark:text-white">Dark Mode</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-400">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3">Page background</td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">bg-slate-50</code></td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">bg-slate-900</code></td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3">Card background</td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">bg-white</code></td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">bg-slate-800</code></td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3">Primary text</td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">text-slate-900</code></td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">text-white</code></td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3">Secondary text</td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">text-slate-600</code></td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">text-slate-400</code></td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3">Muted text</td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">text-slate-500</code></td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">text-slate-400</code></td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 px-3">Border</td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">border-slate-200</code></td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">border-slate-700</code></td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Input background</td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">bg-white</code></td>
                  <td className="py-2 px-3"><code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">bg-slate-800</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Typography
        </h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Font Families
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <p className="font-sans text-xl mb-2">Inter (Sans)</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Primary font for UI and body text
              </p>
              <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                font-sans / font-family: Inter
              </code>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <p className="font-mono text-xl mb-2">JetBrains Mono</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Code blocks and technical text
              </p>
              <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                font-mono / font-family: JetBrains Mono
              </code>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Type Scale
          </h3>
          <div className="space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-baseline gap-4">
              <span className="w-20 text-xs text-slate-500">text-xs</span>
              <span className="text-xs text-slate-900 dark:text-white">12px / 0.75rem - Extra small text</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-20 text-xs text-slate-500">text-sm</span>
              <span className="text-sm text-slate-900 dark:text-white">14px / 0.875rem - Small text, labels</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-20 text-xs text-slate-500">text-base</span>
              <span className="text-base text-slate-900 dark:text-white">16px / 1rem - Body text (default)</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-20 text-xs text-slate-500">text-lg</span>
              <span className="text-lg text-slate-900 dark:text-white">18px / 1.125rem - Section headings</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-20 text-xs text-slate-500">text-xl</span>
              <span className="text-xl text-slate-900 dark:text-white">20px / 1.25rem - Page titles</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-20 text-xs text-slate-500">text-2xl</span>
              <span className="text-2xl text-slate-900 dark:text-white">24px / 1.5rem - Large headings</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="w-20 text-xs text-slate-500">text-3xl</span>
              <span className="text-3xl text-slate-900 dark:text-white">30px / 1.875rem - Hero text</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Font Weights
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="font-normal text-lg mb-1">Normal</p>
              <code className="text-xs text-slate-500">font-normal (400)</code>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="font-medium text-lg mb-1">Medium</p>
              <code className="text-xs text-slate-500">font-medium (500)</code>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="font-semibold text-lg mb-1">Semibold</p>
              <code className="text-xs text-slate-500">font-semibold (600)</code>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="font-bold text-lg mb-1">Bold</p>
              <code className="text-xs text-slate-500">font-bold (700)</code>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Spacing Scale
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Uses Tailwind's default 4px base unit. Common values used in the app:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: '1', px: '4px', usage: 'Tight gaps' },
            { name: '1.5', px: '6px', usage: 'Tag gaps' },
            { name: '2', px: '8px', usage: 'Small padding' },
            { name: '3', px: '12px', usage: 'Icon spacing' },
            { name: '4', px: '16px', usage: 'Card padding' },
            { name: '6', px: '24px', usage: 'Section spacing' },
          ].map((space) => (
            <div key={space.name} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-end gap-2 mb-2">
                <div className="bg-blue-500 rounded" style={{ width: `${parseInt(space.px)}px`, height: '24px' }} />
                <span className="text-lg font-medium text-slate-900 dark:text-white">{space.name}</span>
              </div>
              <p className="text-xs text-slate-500">{space.px}</p>
              <p className="text-xs text-slate-400 mt-1">{space.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Border Radius
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'rounded', value: '4px', usage: 'Small elements' },
            { name: 'rounded-md', value: '6px', usage: 'Default' },
            { name: 'rounded-lg', value: '8px', usage: 'Cards, modals' },
            { name: 'rounded-xl', value: '12px', usage: 'Large containers' },
            { name: 'rounded-full', value: '9999px', usage: 'Pills, avatars' },
          ].map((radius) => (
            <div key={radius.name} className="text-center">
              <div
                className={`h-16 bg-blue-500 mb-2 ${radius.name}`}
              />
              <p className="text-sm font-medium text-slate-900 dark:text-white">{radius.name}</p>
              <p className="text-xs text-slate-500">{radius.value}</p>
              <p className="text-xs text-slate-400 mt-1">{radius.usage}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shadows */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Shadows
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="h-20 bg-white dark:bg-slate-700 rounded-lg shadow-sm mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">shadow-sm</p>
            <p className="text-xs text-slate-500">Subtle elevation</p>
          </div>
          <div className="text-center">
            <div className="h-20 bg-white dark:bg-slate-700 rounded-lg shadow mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">shadow</p>
            <p className="text-xs text-slate-500">Default shadow</p>
          </div>
          <div className="text-center">
            <div className="h-20 bg-white dark:bg-slate-700 rounded-lg shadow-md mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">shadow-md</p>
            <p className="text-xs text-slate-500">Dropdowns</p>
          </div>
          <div className="text-center">
            <div className="h-20 bg-white dark:bg-slate-700 rounded-lg shadow-lg mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">shadow-lg</p>
            <p className="text-xs text-slate-500">Modals, overlays</p>
          </div>
        </div>
      </section>

      {/* Animations */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Animations
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="font-medium text-slate-900 dark:text-white mb-2">fade-in</p>
            <p className="text-xs text-slate-500 mb-3">0.2s ease-out opacity transition</p>
            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">animate-fade-in</code>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="font-medium text-slate-900 dark:text-white mb-2">slide-up</p>
            <p className="text-xs text-slate-500 mb-3">0.2s ease-out slide + fade</p>
            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">animate-slide-up</code>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="font-medium text-slate-900 dark:text-white mb-2">pulse-slow</p>
            <p className="text-xs text-slate-500 mb-3">3s pulse animation</p>
            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">animate-pulse-slow</code>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Standard transitions use <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">transition-colors</code> for hover states.
        </p>
      </section>

      {/* Components */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Components
        </h2>

        {/* Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Buttons
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Primary
              </button>
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                Secondary
              </button>
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Outline
              </button>
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                Ghost
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Danger
              </button>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <p><strong>Primary:</strong> bg-blue-500 text-white hover:bg-blue-600</p>
              <p><strong>Secondary:</strong> bg-slate-100 dark:bg-slate-700 hover:bg-slate-200</p>
              <p><strong>Outline:</strong> border border-slate-200 hover:bg-slate-50</p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Cards
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Standard Card</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Used for entry cards, settings sections, and content containers.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Interactive Card</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Has hover state with border-slate-300 on hover.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3">
            <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4
            </code>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Tags
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <TagPill tag="default" size="md" />
              <TagPill tag="small" size="sm" />
              <TagPill tag="selected" size="md" selected />
              <TagPill tag="removable" size="md" onRemove={() => {}} />
              <TagPill tag="clickable" size="md" onClick={() => {}} />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Tag Input:</p>
              <TagInput
                tags={sampleTags}
                onChange={setSampleTags}
                suggestions={['project', 'idea', 'goal', 'reflection']}
              />
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Form Elements
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Text Input
              </label>
              <input
                type="text"
                placeholder="Placeholder text..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Textarea
              </label>
              <textarea
                rows={3}
                placeholder="Enter text..."
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select
              </label>
              <select className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Status Indicators
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Offline</span>
              </div>
              <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                3 queued
              </span>
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                Processing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Data Constants */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Data Constants
        </h2>

        {/* Moods */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Mood Options
          </h3>
          <div className="flex flex-wrap gap-3">
            {MOOD_OPTIONS.map((mood) => (
              <div
                key={mood.value}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-center"
              >
                <span className="text-2xl block mb-1">{mood.emoji}</span>
                <span className="text-sm text-slate-900 dark:text-white">{mood.label}</span>
                <span className="text-xs text-slate-500 block">{mood.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor Tones */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
            Mentor Tones
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MENTOR_TONE_OPTIONS.map((tone) => (
              <div
                key={tone.value}
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3"
              >
                <p className="font-medium text-slate-900 dark:text-white">{tone.label}</p>
                <p className="text-xs text-slate-500">{tone.description}</p>
                <code className="text-xs text-blue-500 mt-1 block">{tone.value}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layout */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Layout
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">Container</h3>
            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
              max-w-4xl mx-auto px-4 py-6
            </code>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">Desktop Sidebar</h3>
            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
              w-64 fixed inset-y-0 (hidden on mobile)
            </code>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">Mobile Navigation</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>Header: h-14 fixed top-0</li>
              <li>Bottom nav: h-16 fixed bottom-0</li>
              <li>Main content: pt-14 pb-20</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white mb-2">Breakpoints</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li><code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">sm:</code> 640px</li>
              <li><code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">md:</code> 768px</li>
              <li><code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">lg:</code> 1024px (sidebar appears)</li>
              <li><code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">xl:</code> 1280px</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Missing/Suggested Additions */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Potential Additions
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Parameters and features you might want to add when customizing:
        </p>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Brand color:</strong> Currently using blue-500 for primary actions. Consider a custom primary color in tailwind.config.js</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Accent gradients:</strong> No gradients defined. Could add for hero sections or highlights</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Custom icons:</strong> Using inline SVGs. Consider an icon library or custom icon set</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Loading states:</strong> Using animate-pulse for skeletons. Could add spinner component</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Toast notifications:</strong> No toast system. Consider adding for feedback messages</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Modal/Dialog:</strong> Using native confirm(). Consider custom modal component</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Empty states:</strong> Basic empty states. Could enhance with illustrations</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Focus rings:</strong> Using focus:ring-2 focus:ring-blue-500. Could customize ring color/width</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Transitions:</strong> Default 150ms. Could adjust for snappier or smoother feel</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Dark mode colors:</strong> Currently inverted slate. Could use different hue for dark mode</span>
            </li>
          </ul>
        </div>
      </section>

      {/* File Locations */}
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Key Files
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 font-mono text-sm">
          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li><span className="text-blue-500">tailwind.config.js</span> - Color palette, fonts, animations</li>
            <li><span className="text-blue-500">src/index.css</span> - Base styles, TipTap editor, utilities</li>
            <li><span className="text-blue-500">src/types/index.ts</span> - Data constants (moods, tones, options)</li>
            <li><span className="text-blue-500">src/components/ui/</span> - Reusable components</li>
            <li><span className="text-blue-500">src/components/entry/</span> - Entry-specific components</li>
            <li><span className="text-blue-500">src/components/mentor/</span> - AI chat components</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemPage;
