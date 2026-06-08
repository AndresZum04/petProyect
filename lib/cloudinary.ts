export async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error || 'Error al subir imagen')
  return data.url as string
}
