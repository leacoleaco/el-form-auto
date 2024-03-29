import { reactive } from 'vue'

export function isComplexDataType (type) {
  return ['object', 'array', 'wrap'].includes(type)
}

/**
 * get font length of string
 * @param {String} str
 */
export function getStringLength (str) {
  let len = 0
  for (let i = 0; i < str.length; i++) {
    str.charCodeAt(i) > 255 ? len += 2 : len++
  }
  return Math.round(len / 2)
}

/**
 * get longest key's font length of object
 * @param {Object} object
 */
export function getLabelWidth (descriptors, fontSize) {
  let maxLen = 0
  if (descriptors instanceof Array) {
    maxLen = getStringLength('Item ' + descriptors.length)
  } else {
    for (const key in descriptors) {
      if (descriptors[key]) {
        const typeDescriptor = descriptors[key]
        maxLen = Math.max(maxLen, getStringLength(typeDescriptor.label || key))
      } else {
        maxLen = Math.max(maxLen, getStringLength(key))
      }
    }
  }
  return `${maxLen * fontSize + 30}px` // add 30px for required char '*'
}

/**
 * darken color with offset
 * @param {String} color // HEX color
 * @param {Integer} offset // offset to darken, offset should >= 0
 */
const DARKEST_COLOR = 150

export function darkenColor (color, offset) {
  if (!color) return color
  if (offset === 0) return color
  if (color[0] === '#') color = color.slice(1)
  offset = parseInt(offset)
  if (isNaN(offset)) return color

  offset = 0 - offset
  if (offset >= 0) return color

  const num = parseInt(color, 16)
  let r = (num >> 16) + offset
  let b = ((num >> 8) & 0x00FF) + offset
  let g = (num & 0x0000FF) + offset

  r = Math.max(DARKEST_COLOR, r)
  b = Math.max(DARKEST_COLOR, b)
  g = Math.max(DARKEST_COLOR, g)

  const newColor = g | (b << 8) | (r << 16)
  return `#${newColor.toString(16)}`
}

/**
 * create the new binding data by descriptor info
 * @returns {{}|null|*[]}
 * @param descriptor
 */
export function createDescriptorRefData (descriptor) {
  if (['object', 'array'].includes(descriptor.type)) {
    if (descriptor.type === 'object') {
      // for object
      if (descriptor.fields) {
        const data = reactive({})
        for (const key in descriptor.fields) {
          data[key] = createDescriptorRefData(descriptor.fields[key])
        }
        return data
      } else if (descriptor.itemDescriptor) {
        return reactive({})
      }
    } else if (descriptor.type === 'array') {
      // for array
      return reactive([])
    }
  }
  return makeRefValueFromDescriptor(undefined, descriptor)
}

/**
 * make binding value if not match descriptor
 * @param value
 * @param descriptor
 */
export function makeRefValueFromDescriptor (value, descriptor) {
  // debugger
  if (descriptor.type === 'array') {
    const res = value || []
    for (let i = 0; i < res.length; i++) {
      res[i] = makeRefValueFromDescriptor(res[i], descriptor.itemDescriptor)
    }
    return res
  } else if (descriptor.type === 'object') {
    const res = value || {}
    for (const key in descriptor.fields) {
      res[key] = makeRefValueFromDescriptor(res[key], descriptor.fields[key])
    }
    return res
  } else if (descriptor.type === 'wrap') {
    const res = value || {}
    for (const key in descriptor.fields) {
      res[key] = makeRefValueFromDescriptor(res[key], descriptor.fields[key])
    }
    return res
  } else {
    return value || descriptor.defaultValue
  }
}
