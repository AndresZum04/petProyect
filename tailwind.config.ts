import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '1rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			primary: {
  				'50': '#FFFBEB',
  				'100': '#FEF3C7',
  				'200': '#FDE68A',
  				'300': '#FCD34D',
  				'400': '#FBBF24',
  				'500': '#F59E0B',
  				'600': '#D97706',
  				'700': '#B45309',
  				DEFAULT: '#F59E0B',
  				foreground: '#FFFFFF'
  			},
  			background: '#FFFBF5',
  			foreground: '#1E293B',
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#1E293B'
  			},
  			popover: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#1E293B'
  			},
  			secondary: {
  				DEFAULT: '#F5F0E8',
  				foreground: '#374151'
  			},
  			muted: {
  				DEFAULT: '#F3EDE0',
  				foreground: '#6B7280'
  			},
  			accent: {
  				DEFAULT: '#FBBF24',
  				foreground: '#1E293B'
  			},
  			destructive: {
  				DEFAULT: '#EF4444',
  				foreground: '#FFFFFF'
  			},
  			border: '#E8DCC8',
  			input: '#E8DCC8',
  			ring: '#F59E0B',
  			success: '#10B981'
  		},
  		fontFamily: {
  			heading: [
  				'var(--font-jakarta)',
  				'sans-serif'
  			],
  			sans: [
  				'var(--font-inter)',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: '0.75rem',
  			md: '0.5rem',
  			sm: '0.375rem'
  		},
  		boxShadow: {
  			'warm-sm': '0 1px 3px rgba(245,158,11,0.08), 0 1px 2px rgba(0,0,0,0.04)',
  			warm: '0 4px 6px rgba(245,158,11,0.10), 0 2px 4px rgba(0,0,0,0.06)',
  			'warm-md': '0 10px 25px rgba(245,158,11,0.12), 0 4px 6px rgba(0,0,0,0.05)',
  			'warm-lg': '0 20px 40px rgba(245,158,11,0.15), 0 8px 16px rgba(0,0,0,0.06)',
  			card: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(232,220,200,0.5)'
  		},
  		backgroundImage: {
  			'gradient-warm': 'linear-gradient(135deg, #FEF3C7 0%, #FFFBF5 50%, #FFF7ED 100%)',
  			'gradient-amber': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  			'gradient-hero': 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 40%, #FFFBF5 100%)',
  			'overlay-pet': 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)'
  		},
  		animation: {
  			'fade-up': 'fadeUp 0.45s ease-out',
  			'fade-in': 'fadeIn 0.3s ease-out',
  			'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
  			'heart-pop': 'heartPop 0.3s ease-out',
  			'pulse-warm': 'pulseWarm 2s cubic-bezier(0.4,0,0.6,1) infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			fadeUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			heartPop: {
  				'0%': {
  					transform: 'scale(1)'
  				},
  				'50%': {
  					transform: 'scale(1.4)'
  				},
  				'100%': {
  					transform: 'scale(1)'
  				}
  			},
  			pulseWarm: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '.5'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem'
  		},
  		minHeight: {
  			touch: '44px'
  		},
  		minWidth: {
  			touch: '44px'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
