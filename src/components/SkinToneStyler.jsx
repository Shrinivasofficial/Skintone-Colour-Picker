import React, { useState, useRef, useCallback } from 'react'
import { Droplet, Upload } from 'lucide-react'

function hexToHSL(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
      default:
        h = 0
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

function HSLToHex(h, s, l) {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generateColorPalette(skinTone) {
  const [h, s, l] = hexToHSL(skinTone)

  const complementary = (h + 180) % 360
  const triadic1 = (h + 120) % 360
  const triadic2 = (h + 240) % 360

  const topColors = [
    HSLToHex(complementary, Math.min(s + 20, 100), Math.min(l + 20, 90)),
    HSLToHex(triadic1, Math.min(s + 10, 100), Math.min(l + 30, 90)),
    HSLToHex(triadic2, Math.min(s + 10, 100), Math.min(l + 30, 90)),
  ]

  const bottomColors = [
    HSLToHex((h + 30) % 360, Math.max(s - 20, 0), Math.max(l - 20, 10)),
    HSLToHex((h + 210) % 360, Math.max(s - 10, 0), Math.max(l - 30, 10)),
    HSLToHex((h + 330) % 360, Math.max(s - 10, 0), Math.max(l - 30, 10)),
  ]

  return { top: topColors, bottom: bottomColors }
}

export default function SkinToneStyler() {
  const [image, setImage] = useState(null)
  const [skinTone, setSkinTone] = useState('')
  const [suggestions, setSuggestions] = useState({ top: [], bottom: [] })
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result)
      reader.readAsDataURL(file)
    }
  }

  const handleEyedropper = useCallback(() => {
    if (!window.EyeDropper) {
      alert('EyeDropper is not supported in this browser')
      return
    }

    const eyeDropper = new window.EyeDropper()
    eyeDropper.open()
      .then((result) => {
        setSkinTone(result.sRGBHex)
        setSuggestions(generateColorPalette(result.sRGBHex))
      })
      .catch((err) => console.error('EyeDropper failed:', err))
  }, [])

  const handleSkinToneChange = (e) => {
    const newTone = e.target.value
    setSkinTone(newTone)
    if (/^#[0-9A-F]{6}$/i.test(newTone)) {
      setSuggestions(generateColorPalette(newTone))
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-4">Skin Tone Styler</div>
            <div className="flex justify-center mb-4">
              {image ? (
                <img src={image} alt="Uploaded selfie" className="w-64 h-64 object-cover rounded" />
              ) : (
                <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded">
                  <p className="text-gray-500">No image uploaded</p>
                </div>
              )}
            </div>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={skinTone}
                onChange={handleSkinToneChange}
                placeholder="Skin tone color code"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleEyedropper}
                className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Droplet className="h-5 w-5" />
              </button>
            </div>
            {suggestions.top.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Suggested Colors</h3>
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-500">Top</h4>
                  <div className="flex space-x-2 mt-1">
                    {suggestions.top.map((color, index) => (
                      <div key={index} className="w-8 h-8 rounded" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-500">Bottom</h4>
                  <div className="flex space-x-2 mt-1">
                    {suggestions.bottom.map((color, index) => (
                      <div key={index} className="w-8 h-8 rounded" style={{ backgroundColor: color }} title={color} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
