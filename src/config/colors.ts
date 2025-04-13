// Luxury color palette configuration
export const colors = {
  // Main background colors
  bg: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-800',
    tertiary: 'bg-gray-800',
    hover: 'bg-gray-800/50',
    overlay: 'bg-black/80',
    glass: 'bg-gray-900/90 backdrop-blur-md',
    active: 'bg-gray-800/70',
    stats: 'bg-gray-900',
    search: 'bg-gray-900',
    clientCard: 'bg-gray-900',
    offerCard: 'bg-gray-900',
    personalBrand: 'bg-gray-900',
    modal: 'bg-gray-900'
  },

  // Text colors
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-gray-400',
    star: 'text-gray-400',
    success: 'text-gray-400',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    search: 'text-gray-400',
    label: 'text-gray-400 text-sm font-medium'
  },

  // Border colors
  border: {
    primary: 'border border-gray-800',
    secondary: 'border border-gray-800',
    accent: 'border border-gray-700',
    accentMuted: 'border border-gray-800/50',
    hover: 'hover:border-gray-700',
    stats: 'border border-gray-800',
    search: 'border border-gray-800',
    card: 'border border-gray-800',
    input: 'border border-gray-800',
    section: 'border border-gray-800',
    modal: 'border border-gray-800',
    divider: 'border-t border-gray-800'
  },

  // Form elements
  form: {
    input: 'w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-800 shadow-sm transition-all duration-200 min-h-[40px]',
    focus: 'focus:border-gray-700 focus:ring-gray-800',
    success: 'border-gray-700',
    error: 'border-red-500',
    search: 'bg-gray-900 border border-gray-800 rounded-lg transition-all duration-200',
    textarea: 'bg-gray-900 border border-gray-800 rounded-lg resize-none transition-all duration-200',
    select: 'bg-gray-900 border border-gray-800 rounded-lg transition-all duration-200',
    label: 'block text-gray-400 text-sm font-medium mb-2'
  },

  // Button variants
  button: {
    primary: 'bg-gray-800 hover:bg-gray-700 border border-gray-800 rounded-[4px] transition-all duration-200',
    secondary: 'bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-[4px] transition-all duration-200',
    ghost: 'text-gray-400 hover:text-gray-300 border border-transparent',
    danger: 'bg-red-500 hover:bg-red-600 border border-red-600 rounded-[4px]',
    success: 'bg-gray-800 hover:bg-gray-700 border border-gray-800 rounded-[4px]',
    refresh: 'bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800 rounded-[4px]',
    add: 'bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-[4px]',
    filter: 'bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-[4px]',
    addClient: 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-800 rounded-[4px]'
  },

  // Icon colors
  icon: {
    primary: 'text-gray-500',
    secondary: 'text-gray-400',
    hover: 'hover:text-gray-300',
    accent: 'text-gray-500',
    success: 'text-gray-500',
    search: 'text-gray-400'
  },

  // Effects
  effects: {
    hover: 'hover:bg-gray-900',
    active: 'bg-gray-800/70',
    overlay: 'bg-black/80',
    glass: 'bg-gray-900/90 backdrop-blur-md',
    success: 'bg-gray-900/20',
    searchFocus: 'focus:border-gray-700 focus:ring-gray-800'
  },

  // Status colors
  status: {
    success: 'text-gray-400',
    error: 'text-red-500',
    warning: 'text-yellow-500'
  },

  // Gradients
  gradient: {
    text: 'bg-gradient-to-r from-gray-100 to-gray-400',
    border: 'from-transparent via-gray-800 to-transparent',
    overlay: 'bg-gradient-to-t from-black/80 to-transparent'
  },

  // Cards and containers
  card: {
    base: 'bg-gray-900 border border-gray-800 rounded-[4px] hover:border-gray-700 transition-all duration-200',
    client: 'bg-gray-900 border border-gray-800 rounded-[4px] hover:border-gray-700 transition-all duration-200',
    offer: 'bg-gray-900 border border-gray-800 rounded-[4px] hover:border-gray-700 transition-all duration-200',
    stats: 'bg-gray-900 border border-gray-800 rounded-[4px] transition-all duration-200',
    feature: 'bg-gray-900 border border-gray-800 rounded-[4px] transition-all duration-200',
    mentor: 'bg-gray-900 border border-gray-800 rounded-[4px] transition-all duration-200',
    course: 'bg-gray-900 border border-gray-800 rounded-[4px] transition-all duration-200'
  },

  // Sections
  section: {
    primary: 'bg-gray-900 border border-gray-800 rounded-[4px] transition-all duration-200',
    secondary: 'bg-gray-900 border border-gray-800 rounded-[4px] transition-all duration-200',
    content: 'bg-gray-900 border border-gray-800 rounded-[4px] transition-all duration-200'
  },

  // Modals and overlays
  modal: {
    container: 'bg-gray-900 border border-gray-800 rounded-[4px] transition-all duration-200',
    overlay: 'bg-black/50'
  }
} as const;