drop policy if exists "can read own files" on storage.objects;
drop policy if exists "authenticated uploading" on storage.objects;
drop policy if exists "authenticated deleting" on storage.objects;

-- needed for delete to work
create policy "can read own files"
on storage.objects for select to authenticated
using (
  bucket_id = 'uploads'
  and (storage.foldername(name))[1] in ('listings', 'attachments', 'profile_photos')
  and owner = auth.uid()
);

-- only authenticated users can upload to allowed folders
create policy "authenticated uploading"
on storage.objects for insert to authenticated 
with check (
  bucket_id = 'uploads' and (storage.foldername(name))[1] 
  in ('listings', 'attachments', 'profile_photos')
);

-- only authenticated users can delete from allowed folders
-- makes sure user can only delete files they uploaded
create policy "authenticated deleting"
on storage.objects for delete to authenticated 
using (
  bucket_id = 'uploads' and (storage.foldername(name))[1] 
  in ('listings', 'attachments', 'profile_photos')
  and owner = auth.uid()
);