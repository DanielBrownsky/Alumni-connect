import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function uploadProfilePicture(file: File, userId: string) {
  const supabase = createClientComponentClient()
  
  // Create a unique file name
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `profile-pictures/${fileName}`

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file)

  if (error) {
    throw error
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath)

  return publicUrl
}

export async function deleteProfilePicture(filePath: string) {
  const supabase = createClientComponentClient()
  
  const { error } = await supabase.storage
    .from('profile-pictures')
    .remove([filePath])

  if (error) {
    throw error
  }
}
