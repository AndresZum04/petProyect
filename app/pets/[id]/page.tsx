import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import PetDetailContent from '@/components/PetDetailContent'
import type { Pet } from '@/types'

const DEMO_PETS: Record<string, Pet & { story: string; rescue_story: string; health_notes: string; vaccines: { name: string; date: string }[] }> = {
  'demo-1': {
    id: 'demo-1', name: 'Luna', species: 'dog', breed: 'Golden Retriever Mix', age_label: '2 años',
    size: 'large', gender: 'female', status: 'available', special_needs: false,
    personality_tags: ['juguetona', 'cariñosa', 'energética', 'buena con niños', 'ama el agua'],
    photos: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
    ],
    story: 'Luna fue encontrada deambulando cerca de la carretera con un collar improvisado y sin microchip. A pesar de su difícil comienzo, saluda a cada visitante con su característico giro de cola y enamora a todos en segundos. Aprendió cinco comandos en solo dos semanas de hogar temporal — claramente alguien la amó y le enseñó bien.',
    rescue_story: 'Luna fue rescatada el 15 de junio de 2024 a la orilla de la Carretera 35. Un conductor amable la vio y llamó a nuestra línea de rescate. Estaba desnutrida pero de buen ánimo. Tras 3 meses de hogar temporal, está lista para su hogar para siempre.',
    health_notes: 'Completamente vacunada, esterilizada y con microchip. Salud excelente. Pasa todas las pruebas de temperamento con honores.',
    vaccines: [
      { name: 'Rabia', date: 'Jul 2024' },
      { name: 'DHPP', date: 'Jul 2024' },
      { name: 'Bordetella', date: 'Ago 2024' },
    ],
    created_at: new Date().toISOString(),
  },
  'demo-2': {
    id: 'demo-2', name: 'Mochi', species: 'cat', breed: 'Doméstico de Pelo Corto', age_label: '1 año',
    size: 'small', gender: 'male', status: 'available', special_needs: false,
    personality_tags: ['curioso', 'vocal', 'interior', 'juguetón', 'social'],
    photos: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80',
      'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800&q=80',
    ],
    story: 'Mochi llegó a nosotros como un gatito abandonado en una caja de cartón frente a una tienda de conveniencia. Se ha convertido en el alma más curiosa y conversadora que te seguirá de habitación en habitación narrando cada paso de su día. Es el tipo de gato que te hace darte cuenta de que siempre lo necesitaste.',
    rescue_story: 'Encontrado como gatito recién nacido en septiembre de 2023, Mochi fue alimentado con biberón y criado por nuestro dedicado equipo de voluntarios hasta que tuvo la edad suficiente para ser colocado en hogar temporal.',
    health_notes: 'Castrado, vacunado y con microchip. Gato de interior. Se lleva bien con otros gatos.',
    vaccines: [
      { name: 'FVRCP', date: 'Oct 2023' },
      { name: 'Rabia', date: 'Ene 2024' },
    ],
    created_at: new Date().toISOString(),
  },
  'demo-3': {
    id: 'demo-3', name: 'Bruno', species: 'dog', breed: 'Bulldog Francés', age_label: '4 años',
    size: 'small', gender: 'male', status: 'available', special_needs: false,
    personality_tags: ['calmado', 'entrenado', 'leal', 'tranquilo', 'hogareño'],
    photos: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
      'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800&q=80',
    ],
    story: 'Bruno es la definición de elegancia compacta. Este Bulldog Francés de cuatro años llegó a nosotros cuando su familia tuvo que mudarse al extranjero y no pudo llevárselo. Conoce perfectamente sus comandos básicos, adora las siestas en el sofá y es el compañero ideal para alguien que busca un perro tranquilo con mucho carácter.',
    rescue_story: 'Bruno llegó al refugio en marzo de 2024 cuando su familia tuvo que reubicarse repentinamente. Nunca estuvo abandonado — venía con todos sus documentos de vacunación y una carta de amor de su familia anterior.',
    health_notes: 'Vacunado, esterilizado y con microchip. Saludable. Requiere atención a sus arrugas faciales típicas de la raza.',
    vaccines: [
      { name: 'Rabia', date: 'Abr 2024' },
      { name: 'DHPP', date: 'Abr 2024' },
    ],
    created_at: new Date().toISOString(),
  },
  'demo-4': {
    id: 'demo-4', name: 'Cleo', species: 'cat', breed: 'Siamés Mix', age_label: '3 años',
    size: 'medium', gender: 'female', status: 'available', special_needs: false,
    personality_tags: ['elegante', 'cariñosa', 'independiente', 'inteligente', 'vocal'],
    photos: [
      'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=800&q=80',
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&q=80',
    ],
    story: 'Cleo tiene la presencia de una reina y lo sabe. Esta siamesa de tres años te elegirá a su manera — primero te ignorará, luego te conquistará y finalmente te seguirá por toda la casa exigiendo atención con su voz melodiosa. Es perfecta para alguien que aprecia una personalidad con carácter.',
    rescue_story: 'Cleo fue encontrada en una colonia felina urbana en enero de 2024. A pesar de haber vivido afuera, se adaptó rápidamente a la vida en interior y mostró un temperamento gentil desde el primer día.',
    health_notes: 'Esterilizada, vacunada y con microchip. Gata de interior. Prefiere ser la única mascota o convivir con gatos calmados.',
    vaccines: [
      { name: 'FVRCP', date: 'Feb 2024' },
      { name: 'Rabia', date: 'Feb 2024' },
    ],
    created_at: new Date().toISOString(),
  },
  'demo-5': {
    id: 'demo-5', name: 'Max', species: 'dog', breed: 'Labrador Mix', age_label: '6 meses',
    size: 'medium', gender: 'male', status: 'available', special_needs: false,
    personality_tags: ['energético', 'sociable', 'amistoso', 'juguetón', 'curioso'],
    photos: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    ],
    story: 'Max es pura energía embotellada en forma de cachorro. A sus seis meses de vida ya ha conquistado a todos en el refugio con su entusiasmo sin límites y su sonrisa permanente. Es el compañero perfecto para una familia activa que quiera crecer junto a un perro desde pequeño.',
    rescue_story: 'Max fue encontrado junto a sus hermanos en una caja abandonada en un parque en mayo de 2024. Sus hermanos ya fueron adoptados, y él espera pacientemente su turno para encontrar a su familia para siempre.',
    health_notes: 'Vacunado con esquema completo para su edad. Aún en proceso de esterilización. Con microchip.',
    vaccines: [
      { name: 'DHPP (1ra dosis)', date: 'Jun 2024' },
      { name: 'DHPP (2da dosis)', date: 'Jul 2024' },
    ],
    created_at: new Date().toISOString(),
  },
  'demo-6': {
    id: 'demo-6', name: 'Bella', species: 'dog', breed: 'Beagle Mix', age_label: '5 años',
    size: 'medium', gender: 'female', status: 'available', special_needs: false,
    personality_tags: ['tranquila', 'dulce', 'calmada', 'leal', 'gentil'],
    photos: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80',
    ],
    story: 'Bella es la definición de calma y dulzura. Esta Beagle de cinco años ha pasado por mucho, pero nunca ha perdido su capacidad de amar. Le encanta los paseos lentos al atardecer, las siestas largas y estar cerca de su persona favorita. Busca un hogar tranquilo donde pueda pasar sus mejores años.',
    rescue_story: 'Bella llegó al refugio en febrero de 2024 tras ser encontrada vagando sola durante varias semanas. Estaba asustada pero nunca fue agresiva. Con paciencia y amor, floreció en pocas semanas.',
    health_notes: 'Esterilizada, vacunada y con microchip. Saludable para su edad. Se recomienda revisión dental anual.',
    vaccines: [
      { name: 'Rabia', date: 'Mar 2024' },
      { name: 'DHPP', date: 'Mar 2024' },
      { name: 'Bordetella', date: 'Mar 2024' },
    ],
    created_at: new Date().toISOString(),
  },
  'demo-7': {
    id: 'demo-7', name: 'Oliver', species: 'cat', breed: 'Tabby Anaranjado', age_label: '2 años',
    size: 'medium', gender: 'male', status: 'available', special_needs: false,
    personality_tags: ['juguetón', 'curioso', 'aventurero', 'travieso', 'cariñoso'],
    photos: [
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&q=80',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80',
    ],
    story: 'Oliver es el gato que te hará reír todos los días. Este tabby anaranjado de dos años tiene una personalidad enorme: explora cada rincón de la casa, te "ayuda" con el trabajo desde el teclado y se acurruca contigo por las noches como si siempre hubiera sido tuyo. Una vez que lo conoces, no puedes imaginar la vida sin él.',
    rescue_story: 'Oliver fue rescatado de una colonia de gatos de calle en agosto de 2023. Llegó desnutrido pero con una energía y curiosidad que inmediatamente nos indicó que tenía mucho por dar.',
    health_notes: 'Castrado, vacunado y con microchip. Muy saludable. Se lleva bien con otros gatos y perros tranquilos.',
    vaccines: [
      { name: 'FVRCP', date: 'Sep 2023' },
      { name: 'Rabia', date: 'Dic 2023' },
    ],
    created_at: new Date().toISOString(),
  },
  'demo-8': {
    id: 'demo-8', name: 'Daisy', species: 'rabbit', breed: 'Holland Lop', age_label: '1 año',
    size: 'small', gender: 'female', status: 'available', special_needs: false,
    personality_tags: ['gentil', 'tranquila', 'cariñosa', 'curiosa', 'silenciosa'],
    photos: [
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&q=80',
    ],
    story: 'Daisy es la compañera perfecta para quien busca una mascota tranquila y encantadora. Esta Holland Lop de un año tiene las orejas más adorables que hayas visto y un temperamento dulcísimo. Le encanta explorar su espacio, recibir caricias en la cabeza y observar el mundo desde su rincón favorito.',
    rescue_story: 'Daisy fue rescatada en abril de 2024 de una situación de sobrepoblación donde había más de 20 conejos en condiciones inadecuadas. Fue esterilizada, tratada y colocada en hogar temporal donde demostró ser un animal dócil y adaptable.',
    health_notes: 'Esterilizada y revisada por veterinario. Dieta de heno, pellets y verduras frescas. Necesita espacio para moverse a diario.',
    vaccines: [],
    created_at: new Date().toISOString(),
  },
}

async function getPet(id: string): Promise<Pet | null> {
  if (id.startsWith('demo-')) {
    return DEMO_PETS[id] || null
  }
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll() } }
    )
    const { data } = await supabase.from('pets').select('*').eq('id', id).single()
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const pet = await getPet(params.id)
  if (!pet) return { title: 'Pet Not Found — PetConnect' }
  return {
    title: `Adopt ${pet.name} — PetConnect`,
    description: pet.story || `Meet ${pet.name}, a ${pet.breed || pet.species} looking for a forever home.`,
  }
}

export default async function PetDetailPage({ params }: { params: { id: string } }) {
  const pet = await getPet(params.id)
  if (!pet) notFound()

  const demoPet = DEMO_PETS[params.id]
  const story = demoPet?.story || pet.story
  const rescueStory = demoPet?.rescue_story || pet.rescue_story
  const healthNotes = demoPet?.health_notes || pet.health_notes
  const vaccines = demoPet?.vaccines || pet.vaccines || []

  return (
    <PetDetailContent
      pet={pet}
      story={story}
      rescueStory={rescueStory}
      healthNotes={healthNotes}
      vaccines={vaccines}
      requirements={pet.requirements}
      location={pet.location}
      contact={pet.contact}
      intake_date={pet.intake_date}
    />
  )
}
