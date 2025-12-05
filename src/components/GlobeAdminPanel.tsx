import { X, Settings, Globe2, Sparkles, Zap, Eye, Mountain, Waves, Circle, Box, Rotate3d, ZoomIn, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export interface GlobeConfig {
  // Atmosphere
  showAtmosphere: boolean
  atmosphereIntensity: number
  atmosphereColor: string
  
  // Ocean & Surface
  oceanShininess: number
  countryElevation: number
  polygonCurvature: number
  polygonSideGlow: number
  
  // Markers
  markerSize: number
  markerAltitude: number
  markerSmoothness: number
  
  // Visual Quality
  geoJsonResolution: '50m' | '110m'
  backgroundOpacity: number
  
  // Camera & Motion
  autoRotate: boolean
  rotationSpeed: number
  cameraFOV: number
}

export const DEFAULT_GLOBE_CONFIG: GlobeConfig = {
  showAtmosphere: true,
  atmosphereIntensity: 0.15,
  atmosphereColor: '#10b981',
  oceanShininess: 0.1,
  countryElevation: 0,
  polygonCurvature: 4,
  polygonSideGlow: 1,
  markerSize: 1,
  markerAltitude: 0.01,
  markerSmoothness: 8,
  geoJsonResolution: '110m',
  backgroundOpacity: 0,
  autoRotate: false,
  rotationSpeed: 1,
  cameraFOV: 50
}

interface GlobeAdminPanelProps {
  isOpen: boolean
  onClose: () => void
  config: GlobeConfig
  onConfigChange: (config: GlobeConfig) => void
}

export default function GlobeAdminPanel({ isOpen, onClose, config, onConfigChange }: GlobeAdminPanelProps) {
  const [activeSection, setActiveSection] = useState<'atmosphere' | 'surface' | 'markers' | 'camera'>('atmosphere')
  const [lastUpdate, setLastUpdate] = useState<string>('')

  if (!isOpen) return null

  const updateConfig = (updates: Partial<GlobeConfig>) => {
    onConfigChange({ ...config, ...updates })
    // Show which parameter was updated
    const key = Object.keys(updates)[0]
    setLastUpdate(key)
    setTimeout(() => setLastUpdate(''), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Admin Panel - Spaceship Dashboard */}
      <div className="fixed top-0 right-0 h-full w-full md:w-1/2 bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 z-50 shadow-2xl overflow-y-auto transform transition-transform duration-500 border-l-4 border-emerald-400/50">
        
        {/* Header - Command Center */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-900/90 to-teal-900/90 backdrop-blur-md border-b-2 border-emerald-400/30 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-400/20 rounded-lg">
                <Settings className="w-6 h-6 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <h2 className="text-emerald-400 font-mono tracking-wider">GLOBE COMMAND CENTER</h2>
                <p className="text-emerald-300/60 text-sm">Admin Controls • Live Updates</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/30 text-red-400 hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'atmosphere', label: 'Atmosphere', icon: Sparkles },
              { id: 'surface', label: 'Surface', icon: Mountain },
              { id: 'markers', label: 'Markers', icon: Circle },
              { id: 'camera', label: 'Camera', icon: Eye }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                  activeSection === section.id
                    ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/50'
                    : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-700/40'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Container */}
        <div className="p-6 space-y-6">
          
          {/* ATMOSPHERE SECTION */}
          {activeSection === 'atmosphere' && (
            <>
              <ControlGroup title="Atmosphere System" icon={<Sparkles className="w-5 h-5" />}>
                
                {/* Toggle Atmosphere */}
                <ToggleControl
                  label="Atmosphere Glow"
                  sublabel="Enable planetary aura effect"
                  value={config.showAtmosphere}
                  onChange={(value) => updateConfig({ showAtmosphere: value })}
                />

                {/* Atmosphere Intensity */}
                <SliderControl
                  label="Glow Intensity"
                  sublabel="Atmosphere brightness level"
                  value={config.atmosphereIntensity}
                  onChange={(value) => updateConfig({ atmosphereIntensity: value })}
                  min={0.05}
                  max={0.5}
                  step={0.05}
                  unit="lum"
                />

                {/* Background Opacity */}
                <SliderControl
                  label="Space Depth"
                  sublabel="Background darkness level"
                  value={config.backgroundOpacity}
                  onChange={(value) => updateConfig({ backgroundOpacity: value })}
                  min={0}
                  max={1}
                  step={0.1}
                  unit="opacity"
                />
              </ControlGroup>
            </>
          )}

          {/* SURFACE SECTION */}
          {activeSection === 'surface' && (
            <>
              <ControlGroup title="Planet Surface" icon={<Mountain className="w-5 h-5" />}>
                
                {/* Ocean Shininess */}
                <SliderControl
                  label="Ocean Shininess"
                  sublabel="Water surface reflectivity"
                  value={config.oceanShininess}
                  onChange={(value) => updateConfig({ oceanShininess: value })}
                  min={0}
                  max={1}
                  step={0.1}
                  unit="gloss"
                />

                {/* Country Elevation */}
                <SliderControl
                  label="Land Elevation"
                  sublabel="Height of active countries"
                  value={config.countryElevation}
                  onChange={(value) => updateConfig({ countryElevation: value })}
                  min={0}
                  max={0.05}
                  step={0.005}
                  unit="alt"
                />

                {/* Polygon Side Glow */}
                <SliderControl
                  label="Side Glow Intensity"
                  sublabel="3-tier color: Top→Side→Border glow"
                  value={config.polygonSideGlow}
                  onChange={(value) => updateConfig({ polygonSideGlow: value })}
                  min={0}
                  max={2}
                  step={0.1}
                  unit="×"
                />
                
                {/* Visual Explainer */}
                <div className="p-3 bg-emerald-950/60 border border-emerald-400/20 rounded-lg">
                  <div className="text-xs text-emerald-300/80 font-mono leading-relaxed">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span className="font-bold text-emerald-400">3-TIER ELEVATION EFFECT</span>
                    </div>
                    <div className="space-y-1 text-emerald-300/60">
                      <div>🔺 <span className="text-slate-400">Top:</span> Dark base surface</div>
                      <div>🔶 <span className="text-slate-400">Side:</span> Vibrant layer glow ✨</div>
                      <div>⚡ <span className="text-slate-400">Border:</span> Bright outline</div>
                    </div>
                  </div>
                </div>

                {/* Polygon Curvature */}
                <SliderControl
                  label="Surface Smoothness"
                  sublabel="Country polygon curvature detail"
                  value={config.polygonCurvature}
                  onChange={(value) => updateConfig({ polygonCurvature: value })}
                  min={1}
                  max={10}
                  step={1}
                  unit="res"
                />

                {/* GeoJSON Resolution */}
                <SelectControl
                  label="Border Precision"
                  sublabel="Map data resolution quality"
                  value={config.geoJsonResolution}
                  onChange={(value) => updateConfig({ geoJsonResolution: value as '50m' | '110m' })}
                  options={[
                    { value: '110m', label: 'Standard (110m) - Faster' },
                    { value: '50m', label: 'High Detail (50m) - Slower' }
                  ]}
                />
              </ControlGroup>
            </>
          )}

          {/* MARKERS SECTION */}
          {activeSection === 'markers' && (
            <>
              {/* Golden Marker Info */}
              <div className="mb-4 p-3 bg-amber-950/40 border border-amber-400/20 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>City pins are always <strong className="text-yellow-400">GOLDEN</strong> across all themes</span>
                </div>
              </div>
              
              <ControlGroup title="Data Points" icon={<Circle className="w-5 h-5" />}>
                
                {/* Marker Size */}
                <SliderControl
                  label="Marker Scale"
                  sublabel="Base size multiplier for markers"
                  value={config.markerSize}
                  onChange={(value) => updateConfig({ markerSize: value })}
                  min={0.5}
                  max={3}
                  step={0.1}
                  unit="×"
                />

                {/* Marker Altitude */}
                <SliderControl
                  label="Marker Height"
                  sublabel="Distance above planet surface"
                  value={config.markerAltitude}
                  onChange={(value) => updateConfig({ markerAltitude: value })}
                  min={0}
                  max={0.05}
                  step={0.005}
                  unit="alt"
                />

                {/* Marker Smoothness */}
                <SliderControl
                  label="Sphere Quality"
                  sublabel="Marker geometric smoothness"
                  value={config.markerSmoothness}
                  onChange={(value) => updateConfig({ markerSmoothness: value })}
                  min={4}
                  max={32}
                  step={4}
                  unit="poly"
                />
              </ControlGroup>
            </>
          )}

          {/* CAMERA SECTION */}
          {activeSection === 'camera' && (
            <>
              <ControlGroup title="Camera Controls" icon={<Eye className="w-5 h-5" />}>
                
                {/* Auto Rotate Toggle */}
                <ToggleControl
                  label="Auto-Rotation"
                  sublabel="Automatic globe spinning"
                  value={config.autoRotate}
                  onChange={(value) => updateConfig({ autoRotate: value })}
                />

                {/* Rotation Speed */}
                <SliderControl
                  label="Rotation Speed"
                  sublabel="Angular velocity (degrees/sec)"
                  value={config.rotationSpeed}
                  onChange={(value) => updateConfig({ rotationSpeed: value })}
                  min={0}
                  max={5}
                  step={0.5}
                  unit="°/s"
                  disabled={!config.autoRotate}
                />

                {/* Camera FOV */}
                <SliderControl
                  label="Field of View"
                  sublabel="Camera zoom perspective angle"
                  value={config.cameraFOV}
                  onChange={(value) => updateConfig({ cameraFOV: value })}
                  min={30}
                  max={90}
                  step={5}
                  unit="°"
                />
              </ControlGroup>
            </>
          )}

          {/* Status Indicators */}
          <div className="mt-8 p-4 bg-emerald-950/40 border border-emerald-400/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-mono text-sm">SYSTEM STATUS</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Atmosphere:</span>
                <span className="text-emerald-400">{config.showAtmosphere ? 'ACTIVE' : 'OFFLINE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auto-Rotate:</span>
                <span className="text-emerald-400">{config.autoRotate ? 'ENABLED' : 'DISABLED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Side Glow:</span>
                <span className="text-emerald-400">×{config.polygonSideGlow.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resolution:</span>
                <span className="text-emerald-400">{config.geoJsonResolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Markers:</span>
                <span className="text-emerald-400">×{config.markerSize.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Elevation:</span>
                <span className="text-emerald-400">{config.countryElevation > 0 ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-6">
            <button
              onClick={() => updateConfig(DEFAULT_GLOBE_CONFIG)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-red-400 font-mono text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              RESET TO DEFAULTS
            </button>
          </div>

          {/* Live Update Badge */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400/60 font-mono">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            {lastUpdate ? `Updated: ${lastUpdate}` : 'Live Updates Active'}
          </div>

        </div>
      </div>
    </>
  )
}

// Control Group Container
function ControlGroup({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/40 border border-emerald-400/20 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-400/20">
        <div className="text-emerald-400">{icon}</div>
        <h3 className="text-emerald-400 font-mono tracking-wide">{title}</h3>
      </div>
      <div className="space-y-5">
        {children}
      </div>
    </div>
  )
}

// Slider Control
function SliderControl({ 
  label, 
  sublabel, 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  unit,
  disabled = false
}: { 
  label: string
  sublabel: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit: string
  disabled?: boolean
}) {
  return (
    <div className={`${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-slate-200 text-sm font-medium">{label}</div>
          <div className="text-slate-500 text-xs mt-0.5">{sublabel}</div>
        </div>
        <div className="px-3 py-1 bg-emerald-400/10 border border-emerald-400/30 rounded text-emerald-400 font-mono text-sm">
          {value.toFixed(step < 1 ? 2 : 0)}{unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer 
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 
          [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-400/50
          [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:bg-emerald-300
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
          [&::-moz-range-thumb]:bg-emerald-400 [&::-moz-range-thumb]:border-0 
          [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-emerald-400/50
          [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:hover:bg-emerald-300"
        disabled={disabled}
      />
    </div>
  )
}

// Toggle Control
function ToggleControl({ 
  label, 
  sublabel, 
  value, 
  onChange 
}: { 
  label: string
  sublabel: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-slate-200 text-sm font-medium">{label}</div>
        <div className="text-slate-500 text-xs mt-0.5">{sublabel}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
          value ? 'bg-emerald-500' : 'bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${
            value ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

// Select Control
function SelectControl({
  label,
  sublabel,
  value,
  onChange,
  options
}: {
  label: string
  sublabel: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <div className="mb-2">
        <div className="text-slate-200 text-sm font-medium">{label}</div>
        <div className="text-slate-500 text-xs mt-0.5">{sublabel}</div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-700 border border-emerald-400/30 rounded-lg px-3 py-2 text-slate-200 text-sm font-mono cursor-pointer hover:border-emerald-400/50 focus:border-emerald-400 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
