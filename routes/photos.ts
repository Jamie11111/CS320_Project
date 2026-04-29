import type { SupabaseClient } from "@supabase/supabase-js";
import type { BunRequest } from "bun";
import { upload } from "../database/storage";

export const photoRoutes = {
    "/api/listings/photo-upload": {
        POST: async (req: BunRequest, supabase: SupabaseClient) => await uploadPhoto(supabase, req, 'listings'),
    },
    "/api/chat/photo-upload": {
        POST: async (req: BunRequest, supabase: SupabaseClient) => await uploadPhoto(supabase, req, 'attachments'),
    },
    "/api/account/photo-upload": {
        POST: async (req: BunRequest, supabase: SupabaseClient) => await uploadPhoto(supabase, req, 'profile_photos', ['image/jpeg', 'image/png']),
    }
    // delete?
};

/**
 * Upload an image and return the file path and URL
 * @param supabase 
 * Connected database
 * @param req 
 * Request containing the image Blob as the body, and metadata inside of a 'File-Metadata' header field. 
 * @returns 
 * File path and public URL of the image
 */
async function uploadPhoto(supabase: SupabaseClient, req: BunRequest, folder: 'listings' | 'attachments' | 'profile_photos', allowedTypes: string[] = ['image/jpeg', 'image/png', 'video/mp4']) {
    // Require logged in user for uploading image
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        return Response.json({error: error}, {status: 401});
    } else if (!user) {
        return Response.json({error: "Must be logged in to upload image"}, {status: 401});
    }
    const metadata_str = req.headers.get("File-Metadata");
    if (!metadata_str){
        return Response.json({error: "Image upload request must contain 'File-Metadata' field in header"}, {status: 400});
    }
    const metadata: {[ key: string ]: string} = JSON.parse(metadata_str);
    const { filename } = metadata;

    if (!filename){
        return Response.json({error: "'File-Metadata' header field must contain a 'filename' key"}, {status: 400});
    }

    const b: Blob = await req.blob();
    if (!new Set(allowedTypes).has(b.type)){
        return Response.json({error: `Blob type must be one of ${allowedTypes.join(' | ')}`}, {status: 415});
    }

    return upload(supabase, folder, await b.arrayBuffer(), filename, b.type as 'image/jpeg' | 'image/png' | 'video/mp4')
            .then(res => res ? Response.json(res, {status: 201}) 
                             : Response.json({error: "'File-Metadata' header field must contain a 'filename' key"}, {status: 500})); 
}