import type { APIRoute } from "astro";
import { getImage } from "../../lib/crud";

export const get: APIRoute =async ({request, params}) => {
    // 1. get image from db
    // 2. sign token with image
    // 3. redirect to serverless function

    const dbImage = await getImage(params.title!)

    return {
        body: (dbImage as any).toString()
    }
}

